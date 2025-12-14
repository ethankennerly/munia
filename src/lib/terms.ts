import { readFile } from 'fs/promises';
import path from 'path';

export const TERMS_FILE_PATH = path.join(process.cwd(), 'public', 'terms.txt');
export const TERMS_PLACEHOLDER = 'Terms are not available at the moment.';

export async function getTermsText(): Promise<string | null> {
  try {
    const buf = await readFile(TERMS_FILE_PATH);
    return buf.toString('utf-8');
  } catch (e) {
    // Non-PII warning, matches privacy policy behavior
    try {
      console.warn(
        JSON.stringify({ level: 'warn', msg: 'terms_file_read_failed', path: TERMS_FILE_PATH }),
      );
    } catch {}
    return null;
  }
}
