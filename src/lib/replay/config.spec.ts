import { describe, it, expect, beforeEach } from 'vitest';

// Ensure a clean module state per test by clearing env and re-importing
describe('replay config', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.NEXT_PUBLIC_REPLAY_ENABLED;
    delete process.env.REPLAY_ENABLED;
    delete process.env.NEXT_PUBLIC_REPLAY_PRIVATE_SELECTORS;
    delete process.env.REPLAY_PRIVATE_SELECTORS;
    delete process.env.NEXT_PUBLIC_REPLAY_RETENTION_DAYS;
    delete process.env.REPLAY_RETENTION_DAYS;
  });

  it('returns defaults when env not set', async () => {
    const { getReplayConfig } = await import('./config');
    const cfg = getReplayConfig();
    expect(cfg.enabled).toBe(false);
    expect(cfg.privateSelectors).toEqual([]);
    expect(cfg.retentionDays).toBeGreaterThanOrEqual(1);
  });

  it('parses booleans and CSV selectors from NEXT_PUBLIC_*', async () => {
    process.env.NEXT_PUBLIC_REPLAY_ENABLED = 'true';
    process.env.NEXT_PUBLIC_REPLAY_PRIVATE_SELECTORS = '.secret, [data-private],  #id ';
    const { getReplayConfig } = await import('./config');
    const cfg = getReplayConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.privateSelectors).toEqual(['.secret', '[data-private]', '#id']);
  });

  it('falls back to non-public envs and clamps retention days', async () => {
    process.env.REPLAY_ENABLED = '1';
    process.env.REPLAY_RETENTION_DAYS = '-5';
    const { getReplayConfig } = await import('./config');
    const cfg = getReplayConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.retentionDays).toBe(1); // clamped
  });
});
