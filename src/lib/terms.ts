import { readFile } from 'fs/promises';
import path from 'path';
import { logger } from '@/lib/logging';

export const TERMS_FILE_PATH = path.join(process.cwd(), 'public', 'terms.txt');
export const TERMS_PLACEHOLDER = 'Terms are not available at the moment.';

export async function getTermsText(): Promise<string | null> {
  try {
    const buf = await readFile(TERMS_FILE_PATH);
    return buf.toString('utf-8');
  } catch (e) {
    // Non-PII warning, matches privacy policy behavior
    logger.warn({ msg: 'terms_file_read_failed', path: TERMS_FILE_PATH });
    return null;
  }
}
