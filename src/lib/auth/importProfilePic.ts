import 'server-only';

import { v4 as uuid } from 'uuid';
import prisma from '@/lib/prisma/prisma';
import { uploadObject } from '@/lib/s3/uploadObject';
import { fileNameToUrl } from '@/lib/s3/fileNameToUrl';
import { logger } from '@/lib/logging';

/** Per-provider allowed hostname patterns for profile picture URLs. */
const ALLOWED_HOSTS: Record<string, RegExp> = {
  google: /^lh\d+\.googleusercontent\.com$/i,
  github: /^avatars\.githubusercontent\.com$/i,
  facebook: /^platform-lookaside\.fbsbx\.com$/i,
  'mock-oauth': /^i\.pravatar\.cc$/i,
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const TIMEOUT_MS = 5000;

function isAllowedHost(url: URL, provider: string) {
  const regex = ALLOWED_HOSTS[provider];
  if (!regex) return false;
  return regex.test(url.hostname);
}

async function fetchWithLimit(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`fetch_failed_status_${res.status}`);

    const contentLengthHeader = res.headers.get('content-length');
    if (contentLengthHeader) {
      const len = Number(contentLengthHeader);
      if (Number.isFinite(len) && len > MAX_BYTES) throw new Error('content_too_large');
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length > MAX_BYTES) throw new Error('content_too_large');

    const contentType = String(res.headers.get('content-type') || '').toLowerCase();
    return { buffer, contentType };
  } finally {
    clearTimeout(timeout);
  }
}

export async function importProfilePic({
  pictureUrl,
  userId,
  provider,
}: {
  pictureUrl: string;
  userId: string;
  provider: string;
}) {
  if (!pictureUrl) return null;

  let url: URL;
  try {
    url = new URL(pictureUrl);
  } catch {
    logger.warn({ msg: 'import_profile_invalid_url', provider, url: pictureUrl });
    logger.info({ msg: 'import_profile_metric', provider, event: 'failure', reason: 'invalid_url' });
    return null;
  }

  if (url.protocol !== 'https:') {
    logger.warn({ msg: 'import_profile_non_https', provider, url: pictureUrl });
    logger.info({ msg: 'import_profile_metric', provider, event: 'failure', reason: 'non_https' });
    return null;
  }

  if (!isAllowedHost(url, provider)) {
    logger.warn({ msg: 'import_profile_disallowed_host', provider, host: url.hostname });
    logger.info({ msg: 'import_profile_metric', provider, event: 'failure', reason: 'disallowed_host' });
    return null;
  }

  try {
    const { buffer, contentType } = await fetchWithLimit(pictureUrl);

    if (!contentType.startsWith('image/')) {
      logger.warn({ msg: 'import_profile_not_image', provider, contentType });
      return null;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(contentType.split(';')[0])) {
      logger.warn({ msg: 'import_profile_unsupported_type', provider, contentType });
      return null;
    }

    // Validate magic bytes for JPEG/PNG to avoid processing unexpected formats
    const sig = buffer.slice(0, 8);
    const isJpeg = sig[0] === 0xff && sig[1] === 0xd8 && sig[2] === 0xff;
    const isPng =
      sig[0] === 0x89 &&
      sig[1] === 0x50 &&
      sig[2] === 0x4e &&
      sig[3] === 0x47 &&
      sig[4] === 0x0d &&
      sig[5] === 0x0a &&
      sig[6] === 0x1a &&
      sig[7] === 0x0a;

    if (!isJpeg && !isPng) {
      logger.warn({ msg: 'import_profile_invalid_signature', provider });
      logger.info({ msg: 'import_profile_metric', provider, event: 'failure', reason: 'invalid_signature' });
      return null;
    }

    const fileExtension = isPng ? 'png' : 'jpg';
    const fileName = `${Date.now()}-${uuid()}.${fileExtension}`;
    const mimeType = (contentType && contentType.split(';')[0]) || (isPng ? 'image/png' : 'image/jpeg');

    // Upload original bytes (no resizing) per spec
    await uploadObject(buffer, fileName, mimeType);

    // Update user's profile photo only (do NOT create a post)
    await prisma.user.update({ where: { id: userId }, data: { profilePhoto: fileName } });

    const uploadedTo = fileNameToUrl(fileName);
    logger.info({ msg: 'import_profile_success', provider, userId, uploadedTo });
    logger.info({ msg: 'import_profile_metric', provider, event: 'success', userId });
    return { fileName, uploadedTo };
  } catch (error) {
    const reason = (error as Error)?.message ?? 'unknown';
    logger.warn({ msg: 'import_profile_failed', provider, err: reason });
    logger.info({ msg: 'import_profile_metric', provider, event: 'failure', reason });
    return null;
  }
}
