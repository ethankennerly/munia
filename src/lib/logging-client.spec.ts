/* eslint-disable import/first */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Ensure a clean module state per test by clearing env and re-importing
describe('logging-client', () => {
  const OLD_ENV = process.env;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL;
    delete process.env.npm_config_loglevel;
    delete process.env.NODE_ENV;
    delete process.env.VITEST_WORKER_ID;
    
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clear module cache to force re-evaluation of constants
    vi.resetModules();
  });

  it('uses debug level in test environment', async () => {
    process.env.VITEST_WORKER_ID = '1';
    vi.resetModules();
    const { logger } = await import('./logging-client');
    logger.debug({ message: 'test' });
    expect(consoleDebugSpy).toHaveBeenCalled();
  });

  it('maps npm loglevel "warn" correctly', async () => {
    process.env.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL = 'warn';
    process.env.NODE_ENV = 'production';
    vi.resetModules();
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
    process.env.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL = 'info';
    process.env.NODE_ENV = 'production';
    vi.resetModules();
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
    process.env.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL = 'error';
    process.env.NODE_ENV = 'production';
    vi.resetModules();
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
    process.env.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL = 'silent';
    process.env.NODE_ENV = 'production';
    vi.resetModules();
    const { logger } = await import('./logging-client');
    
    logger.error({ message: 'error' });
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    logger.warn({ message: 'warn' });
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('maps npm loglevel "verbose" to debug level', async () => {
    process.env.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL = 'verbose';
    process.env.NODE_ENV = 'production';
    vi.resetModules();
    const { logger } = await import('./logging-client');
    
    logger.debug({ message: 'debug' });
    expect(consoleDebugSpy).toHaveBeenCalled();
  });

  it('defaults to debug in development when loglevel not set', async () => {
    process.env.NODE_ENV = 'development';
    vi.resetModules();
    const { logger } = await import('./logging-client');
    
    logger.debug({ message: 'debug' });
    expect(consoleDebugSpy).toHaveBeenCalled();
  });

  it('defaults to info in production when loglevel not set', async () => {
    process.env.NODE_ENV = 'production';
    vi.resetModules();
    const { logger } = await import('./logging-client');
    
    logger.info({ message: 'info' });
    expect(consoleInfoSpy).toHaveBeenCalled();
    
    logger.debug({ message: 'debug' });
    expect(consoleDebugSpy).not.toHaveBeenCalled(); // debug disabled at info level
  });

  it('uses correct console methods for each log level', async () => {
    process.env.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL = 'verbose';
    process.env.NODE_ENV = 'production';
    vi.resetModules();
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
    process.env.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL = 'info';
    process.env.NODE_ENV = 'production';
    vi.resetModules();
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
    process.env.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL = 'warn';
    process.env.NODE_ENV = 'production';
    vi.resetModules();
    const { logger } = await import('./logging-client');
    
    // These should be no-ops
    logger.info({ message: 'info' });
    logger.debug({ message: 'debug' });
    
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });
});

