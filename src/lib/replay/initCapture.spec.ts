import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// We will manipulate env and (re)import the module to pick up config
const OLD_ENV = process.env;

describe('initCapture minimal recorder', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.NEXT_PUBLIC_REPLAY_ENABLED;
    delete process.env.REPLAY_ENABLED;
  });
  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('is disabled by default and does nothing', async () => {
    const mod = await import('./initCapture');
    mod.resetForTests();
    expect(mod.isEnabled()).toBe(false);
    // start returns false when disabled
    expect(mod.start()).toBe(false);
    // record should be a no-op and flush returns empty
    mod.record({ type: 'click', data: { x: 1 } });
    expect(mod.flush()).toEqual([]);
  });

  it('respects REPLAY_ENABLED flag and buffers events while running', async () => {
    process.env.NEXT_PUBLIC_REPLAY_ENABLED = 'true';
    const mod = await import('./initCapture');
    mod.resetForTests();
    expect(mod.isEnabled()).toBe(true);
    expect(mod.start()).toBe(true);

    mod.record({ type: 'e1' });
    mod.record({ type: 'e2', data: { a: 1 } });
    const firstFlush = mod.flush();
    expect(firstFlush.length).toBe(2);
    expect(firstFlush.map((e) => e.type)).toEqual(['e1', 'e2']);

    // After flush, buffer is empty
    expect(mod.flush()).toEqual([]);

    // Stop prevents further buffering
    mod.stop();
    mod.record({ type: 'after-stop' });
    expect(mod.flush()).toEqual([]);
  });
});
