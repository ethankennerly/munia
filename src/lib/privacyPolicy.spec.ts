/* eslint-disable import/first, @typescript-eslint/no-explicit-any */
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
import { getPrivacyPolicyText } from './privacyPolicy';

describe('getPrivacyPolicyText', () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    warnSpy.mockClear();
  });

  it('returns text when file exists', async () => {
    (fs.readFile as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('Hello\nWorld');
    const txt = await getPrivacyPolicyText();
    expect(txt).toBe('Hello\nWorld');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns null and logs a warning when file is missing (ENOENT)', async () => {
    (fs.readFile as unknown as ReturnType<typeof vi.fn>).mockRejectedValue({ code: 'ENOENT' });
    const txt = await getPrivacyPolicyText();
    expect(txt).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('returns null and logs a warning on other errors', async () => {
    (fs.readFile as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));
    const txt = await getPrivacyPolicyText();
    expect(txt).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
