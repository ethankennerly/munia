// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('fs', async (orig) => {
  const actual = await (orig() as any);
  return {
    ...actual,
    promises: {
      readFile: vi.fn(),
    },
  };
});

import { promises as fs } from 'fs';
import { getTermsText, TERMS_FILE_PATH } from './terms';

describe('getTermsText', () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    warnSpy.mockClear();
  });

  it('returns text when file can be read', async () => {
    (fs.readFile as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(Buffer.from('hello terms', 'utf-8'));
    const text = await getTermsText();
    expect(text).toBe('hello terms');
    expect(fs.readFile).toHaveBeenCalledWith(TERMS_FILE_PATH);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns null and logs a warning when file read fails', async () => {
    (fs.readFile as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('ENOENT'));
    const text = await getTermsText();
    expect(text).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
