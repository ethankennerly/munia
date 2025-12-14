import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('fs/promises', async () => {
  const mod = await vi.importActual<typeof import('fs/promises')>('fs/promises');
  return {
    ...mod,
    readFile: vi.fn(),
  };
});

/* eslint-disable import/first, @typescript-eslint/no-explicit-any */
import { readFile } from 'fs/promises';
import { getTermsText, TERMS_FILE_PATH } from './terms';

describe('getTermsText', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns text when file can be read', async () => {
    (readFile as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(Buffer.from('hello terms', 'utf-8'));
    const text = await getTermsText();
    expect(text).toBe('hello terms');
    expect(readFile).toHaveBeenCalledWith(TERMS_FILE_PATH);
  });

  it('returns null and logs a warning when file read fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (readFile as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('ENOENT'));
    const text = await getTermsText();
    expect(text).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
