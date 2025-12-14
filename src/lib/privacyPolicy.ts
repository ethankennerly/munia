import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '@/lib/logging';

export const PRIVACY_POLICY_PATH = path.join(process.cwd(), 'public', 'privacy-policy.txt');
export const PRIVACY_POLICY_PLACEHOLDER = 'Privacy policy not available';

/**
 * Reads the privacy policy text from the local filesystem.
 * - Returns the file contents as UTF-8 text when present.
 * - Returns null when the file is missing or unreadable. In that case, logs a warning.
 */
export async function getPrivacyPolicyText(): Promise<string | null> {
  try {
    const buf = await fs.readFile(PRIVACY_POLICY_PATH, 'utf8');
    // Ensure it's a string and preserve as-is (rendering layer will handle whitespace)
    return typeof buf === 'string' ? buf : String(buf);
  } catch (err) {
    const e = err as { code?: string; message?: string } | undefined;
    logger.warn({ msg: 'privacy_policy_read_failed', reason: e?.code || e?.message || 'unknown' });
    return null;
  }
}
