'use client';

type Level = 'error' | 'warn' | 'info' | 'debug';

// Build-time: Reads NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL (exposed from npm_config_loglevel via next.config.js)
// Next.js replaces NEXT_PUBLIC_* variables at build time
// Maps npm loglevels: silent/error -> 'error', warn -> 'warn', verbose/silly -> 'debug', default -> 'info'
function resolveLogLevel(): Level {
  // In tests, enable verbose logging so spies on console methods work reliably
  if (process.env.NODE_ENV === 'test' || process.env.VITEST_WORKER_ID) return 'debug';
  // Read from NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL (exposed by next.config.js from npm_config_loglevel)
  // Fallback to npm_config_loglevel for build-time access (may be available during build)
  const npm = (
    process.env.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL ||
    process.env.npm_config_loglevel ||
    ''
  ).toLowerCase();
  if (npm === 'silent' || npm === 'error') return 'error';
  if (npm === 'warn') return 'warn';
  if (npm === 'verbose' || npm === 'silly') return 'debug';
  // Default: 'info' for production, 'debug' for development
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

const LOG_LEVEL = resolveLogLevel();

// Build-time constants (enables tree-shaking)
const ENABLE_ERROR = true; // Always enabled
const ENABLE_WARN = LOG_LEVEL === 'warn' || LOG_LEVEL === 'info' || LOG_LEVEL === 'debug';
const ENABLE_INFO = LOG_LEVEL === 'info' || LOG_LEVEL === 'debug';
const ENABLE_DEBUG = LOG_LEVEL === 'debug';

export const logger = {
  error: ENABLE_ERROR
    ? (obj: Record<string, unknown>) => {
        // eslint-disable-next-line no-console
        console.error(JSON.stringify({ level: 'error', ...obj }));
      }
    : () => {},
  warn: ENABLE_WARN
    ? (obj: Record<string, unknown>) => {
        // eslint-disable-next-line no-console
        console.warn(JSON.stringify({ level: 'warn', ...obj }));
      }
    : () => {},
  info: ENABLE_INFO
    ? (obj: Record<string, unknown>) => {
        // eslint-disable-next-line no-console
        console.info(JSON.stringify({ level: 'info', ...obj }));
      }
    : () => {},
  debug: ENABLE_DEBUG
    ? (obj: Record<string, unknown>) => {
        // eslint-disable-next-line no-console
        console.debug(JSON.stringify({ level: 'debug', ...obj }));
      }
    : () => {},
};
