/**
 * DELETE /api/posts/:postId
 * - Allows an authenticated post owner to delete a post.
 * - Requires recent authentication (≤ 5 minutes) and explicit confirmation.
 * - Hard deletes the post in the DB and removes associated media from S3.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import { deleteObject } from '@/lib/s3/deleteObject';
import { logger } from '@/lib/logging';
import { verifyAccessToPost } from './verifyAccessToPost';

// 5 minutes in ms
const RECENT_MS = 5 * 60 * 1000;

export async function DELETE(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  // Entry log
  logger.info({
    msg: 'api_post_delete_enter',
    url: (request as unknown as { url?: string })?.url ?? null,
    method: 'DELETE',
    at: new Date().toISOString(),
  });

  const { postId: postIdParam } = await params;
  const postId = parseInt(postIdParam, 10);
  logger.debug({
    msg: 'api_post_delete_params',
    postId,
    isNaN: Number.isNaN(postId),
    contentType: request.headers.get('content-type') || null,
  });

  // Validate request body for confirmation and recent-auth timestamp
  let confirm: unknown;
  let recentAuthTimestamp: unknown;
  try {
    const body = (await request.json()) as { confirm?: unknown; recentAuthTimestamp?: unknown };
    confirm = body?.confirm;
    recentAuthTimestamp = body?.recentAuthTimestamp;
    logger.debug({
      msg: 'api_post_body_parsed',
      hasConfirm: typeof confirm === 'boolean',
      hasRecent: typeof recentAuthTimestamp === 'number',
      recentType: typeof recentAuthTimestamp,
    });
  } catch {
    logger.warn({ msg: 'api_post_guard_fail', reason: 'invalid_json' });
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!confirm) {
    logger.warn({ msg: 'api_post_guard_fail', reason: 'missing_confirmation' });
    return NextResponse.json({ error: 'Confirmation required' }, { status: 400 });
  }
  const ts = Number(recentAuthTimestamp);
  if (!Number.isFinite(ts) || Date.now() - ts > RECENT_MS) {
    logger.warn({ msg: 'api_post_guard_fail', reason: 'stale_recent_auth', now: Date.now(), recentAuthAt: ts });
    return NextResponse.json({ error: 'Re-authentication required' }, { status: 401 });
  }

  // Ownership/auth check
  logger.debug({ msg: 'api_post_verify_access_start', postId });
  const hasAccess = await verifyAccessToPost(postId);
  logger.debug({ msg: 'api_post_verify_access_result', hasAccess });
  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Collect media filenames BEFORE deleting post, to determine cross-references
  const mediaRows = await prisma.visualMedia.findMany({
    where: { postId },
    select: { fileName: true },
  });
  const filenames = mediaRows.map((m) => m.fileName);

  // Determine which files are referenced elsewhere (by other posts or as profile/cover photos)
  let toDelete: string[] = filenames;
  if (filenames.length > 0) {
    const [otherPostRefs, userPhotoRefs] = await Promise.all([
      prisma.visualMedia.findMany({
        where: { fileName: { in: filenames }, NOT: { postId } },
        select: { fileName: true },
      }),
      prisma.user.findMany({
        where: {
          OR: [{ profilePhoto: { in: filenames } }, { coverPhoto: { in: filenames } }],
        },
        select: { profilePhoto: true, coverPhoto: true },
      }),
    ]);

    const otherSet = new Set(otherPostRefs.map((r) => r.fileName));
    const userSet = new Set<string>();
    for (const u of userPhotoRefs) {
      if (u.profilePhoto) userSet.add(u.profilePhoto);
      if (u.coverPhoto) userSet.add(u.coverPhoto);
    }
    const keepSet = new Set<string>([...otherSet, ...userSet]);
    const kept = filenames.filter((f) => keepSet.has(f));
    toDelete = filenames.filter((f) => !keepSet.has(f));
    logger.debug({ msg: 'media_reference_scan', total: filenames.length, keep: kept.length, delete: toDelete.length });
  }

  // Delete the `post` (its VisualMedia rows are removed via cascade)
  logger.debug({ msg: 'db_delete_start', postId });
  const deleted = await prisma.post.delete({
    select: { id: true },
    where: { id: postId },
  });
  logger.info({ msg: 'db_delete_result', ok: true, postId });

  // Best-effort S3 cleanup for files that are no longer referenced anywhere
  logger.debug({ msg: 's3_cleanup_start', count: toDelete.length });
  await Promise.all(
    toDelete.map(async (f) => {
      try {
        await deleteObject(f);
      } catch {
        // ignore individual delete failures
      }
    }),
  );
  logger.debug({ msg: 's3_cleanup_result', ok: true });

  logger.info({ msg: 'api_post_response', status: 200 });
  return NextResponse.json({ id: deleted.id });
}
