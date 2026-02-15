import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Ensure a clean module state per test by clearing env and re-importing
describe('logging-client', () => {
  beforeEach(() => {
    // Unstub any previously stubbed environment variables
    vi.unstubAllEnvs();
    // Clear module cache to force re-evaluation of constants
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    // Clear module cache to force re-evaluation of constants
    vi.resetModules();
  });

  it('uses debug level in test environment', async () => {
    vi.stubEnv('VITEST_WORKER_ID', '1');
    vi.resetModules();

    const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const { logger } = await import('./logging-client');

    logger.debug({ message: 'test' });
    expect(consoleDebugSpy).toHaveBeenCalled();
  });

  it('maps npm loglevel "warn" correctly', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL', 'warn');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VITEST_WORKER_ID', '');
    vi.resetModules();

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { logger } = await import('./logging-client');

    logger.error({ message: 'error' });
    expect(consoleErrorSpy).toHaveBeenCalled();

    logger.warn({ message: 'warn' });
    expect(consoleWarnSpy).toHaveBeenCalled();

    logger.info({ message: 'info' });
    expect(consoleInfoSpy).not.toHaveBeenCalled(); // info disabled at warn level

    logger.debug({ message: 'debug' });
    expect(consoleDebugSpy).not.toHaveBeenCalled(); // debug disabled at warn level
  });

  it('maps npm loglevel "info" correctly', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL', 'info');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VITEST_WORKER_ID', '');
    vi.resetModules();

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { logger } = await import('./logging-client');

    logger.error({ message: 'error' });
    expect(consoleErrorSpy).toHaveBeenCalled();

    logger.warn({ message: 'warn' });
    expect(consoleWarnSpy).toHaveBeenCalled();

    logger.info({ message: 'info' });
    expect(consoleInfoSpy).toHaveBeenCalled();

    logger.debug({ message: 'debug' });
    expect(consoleDebugSpy).not.toHaveBeenCalled(); // debug disabled at info level
  });

  it('maps npm loglevel "error" correctly', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL', 'error');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VITEST_WORKER_ID', '');
    vi.resetModules();

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { logger } = await import('./logging-client');

    logger.error({ message: 'error' });
    expect(consoleErrorSpy).toHaveBeenCalled();

    logger.warn({ message: 'warn' });
    expect(consoleWarnSpy).not.toHaveBeenCalled(); // warn disabled at error level

    logger.info({ message: 'info' });
    expect(consoleInfoSpy).not.toHaveBeenCalled(); // info disabled at error level

    logger.debug({ message: 'debug' });
    expect(consoleDebugSpy).not.toHaveBeenCalled(); // debug disabled at error level
  });

  it('maps npm loglevel "silent" to error level', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL', 'silent');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VITEST_WORKER_ID', '');
    vi.resetModules();

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { logger } = await import('./logging-client');

    logger.error({ message: 'error' });
    expect(consoleErrorSpy).toHaveBeenCalled();

    logger.warn({ message: 'warn' });
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('maps npm loglevel "verbose" to debug level', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL', 'verbose');
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();

    const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { logger } = await import('./logging-client');

    logger.debug({ message: 'debug' });
    expect(consoleDebugSpy).toHaveBeenCalled();
  });

  it('defaults to debug in development when loglevel not set', async () => {
    vi.unstubAllEnvs();
    vi.resetModules();
    // Override process.env right before import
    const originalEnv = process.env;
    const testEnv = {
      ...originalEnv,
      NODE_ENV: 'development',
    } as any;
    // Delete VITEST_WORKER_ID to ensure we don't default to debug
    delete testEnv.VITEST_WORKER_ID;
    delete testEnv.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL;
    delete testEnv.npm_config_loglevel;
    (process as any).env = testEnv;
    vi.resetModules();

    const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { logger } = await import('./logging-client');

    logger.debug({ message: 'debug' });
    expect(consoleDebugSpy).toHaveBeenCalled();

    (process as any).env = originalEnv;
  });

  it('defaults to info in production when loglevel not set', async () => {
    vi.unstubAllEnvs();
    vi.resetModules();
    // Override process.env right before import
    const originalEnv = process.env;
    const testEnv = {
      ...originalEnv,
      NODE_ENV: 'production',
    } as any;
    // Delete VITEST_WORKER_ID to ensure we use default behavior
    delete testEnv.VITEST_WORKER_ID;
    delete testEnv.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL;
    delete testEnv.npm_config_loglevel;
    (process as any).env = testEnv;
    vi.resetModules();

    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { logger } = await import('./logging-client');

    logger.info({ message: 'info' });
    expect(consoleInfoSpy).toHaveBeenCalled();

    logger.debug({ message: 'debug' });
    expect(consoleDebugSpy).not.toHaveBeenCalled(); // debug disabled at info level

    (process as any).env = originalEnv;
  });

  it('uses correct console methods for each log level', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL', 'verbose');
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { logger } = await import('./logging-client');

    logger.error({ message: 'error' });
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"error"'));

    logger.warn({ message: 'warn' });
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"warn"'));

    logger.info({ message: 'info' });
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"info"'));

    logger.debug({ message: 'debug' });
    expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"debug"'));
  });

  it('formats logs as JSON with level and message', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL', 'info');
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();

    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const { logger } = await import('./logging-client');

    logger.info({ message: 'test', userId: '123' });
    const call = consoleInfoSpy.mock.calls[0][0];
    const parsed = JSON.parse(call);
    expect(parsed).toMatchObject({
      level: 'info',
      message: 'test',
      userId: '123',
    });
  });

  it('disabled levels are no-ops (do not call console)', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL', 'warn');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VITEST_WORKER_ID', '');
    vi.resetModules();

    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { logger } = await import('./logging-client');

    // These should be no-ops
    logger.info({ message: 'info' });
    logger.debug({ message: 'debug' });

    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });
});
