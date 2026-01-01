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

// Build-time: Reads NEXT_PUBLIC_LOG_CHANNELS (comma-separated channel names)
// Next.js replaces NEXT_PUBLIC_* variables at build time, but in dev mode it's available at runtime
function resolveChannels(): Set<string> {
  // Access env var directly - Next.js will replace NEXT_PUBLIC_* at build time
  // In development, this is also available at runtime from .env.local
  // Note: If you change .env.local, you need to restart the dev server for changes to take effect
  const fromEnv = process.env.NEXT_PUBLIC_LOG_CHANNELS || '';
  if (!fromEnv) return new Set();
  // Special case: "NONE" means disable all channels
  if (fromEnv.toUpperCase() === 'NONE') return new Set(['__NONE__']);
  // Parse comma-separated channel names (e.g., "SCROLL,API,DB")
  const channels = new Set(fromEnv.split(',').map((ch) => ch.trim().toUpperCase()));
  // Debug: Log resolved channels in development (only once at module load)
  // This helps verify that the env var is being read correctly
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[logging-client] NEXT_PUBLIC_LOG_CHANNELS:', fromEnv, '→ Resolved channels:', Array.from(channels));
  }
  return channels;
}

const LOG_LEVEL = resolveLogLevel();
const ENABLED_CHANNELS = resolveChannels();

// Debug: Log resolved log level in development (only once at module load)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log('[logging-client] LOG_LEVEL:', LOG_LEVEL, 'ENABLE_DEBUG:', LOG_LEVEL === 'debug', 'ENABLE_INFO:', LOG_LEVEL === 'info' || LOG_LEVEL === 'debug');
}

// Build-time constants (enables tree-shaking)
const ENABLE_ERROR = true; // Always enabled
const ENABLE_WARN = LOG_LEVEL === 'warn' || LOG_LEVEL === 'info' || LOG_LEVEL === 'debug';
const ENABLE_INFO = LOG_LEVEL === 'info' || LOG_LEVEL === 'debug';
const ENABLE_DEBUG = LOG_LEVEL === 'debug';

function isChannelEnabled(channel: string): boolean {
  // If no channels are configured, all channels are enabled (backward compatibility)
  if (ENABLED_CHANNELS.size === 0) return true;
  // Special case: "__NONE__" means all channels are disabled
  if (ENABLED_CHANNELS.has('__NONE__')) return false;
  return ENABLED_CHANNELS.has(channel.toUpperCase());
}

export const logger = {
  error: ENABLE_ERROR
    ? (obj: Record<string, unknown>, channel?: string) => {
        // Check channel if provided - early return to avoid object allocation
        if (channel && !isChannelEnabled(channel)) return;
        // Prefix message with channel if provided
        const originalMessage = obj.message || '';
        const prefixedMessage = channel ? `[${channel.toUpperCase()}] ${originalMessage}` : originalMessage;
        // eslint-disable-next-line no-console
        console.error(JSON.stringify({ level: 'error', ...obj, message: prefixedMessage }));
      }
    : () => {},
  warn: ENABLE_WARN
    ? (obj: Record<string, unknown>, channel?: string) => {
        // Check channel if provided - early return to avoid object allocation
        if (channel && !isChannelEnabled(channel)) return;
        // Prefix message with channel if provided
        const originalMessage = obj.message || '';
        const prefixedMessage = channel ? `[${channel.toUpperCase()}] ${originalMessage}` : originalMessage;
        // eslint-disable-next-line no-console
        console.warn(JSON.stringify({ level: 'warn', ...obj, message: prefixedMessage }));
      }
    : () => {},
  info: ENABLE_INFO
    ? (obj: Record<string, unknown>, channel?: string) => {
        // Check channel if provided - early return to avoid object allocation
        if (channel && !isChannelEnabled(channel)) return;
        // Prefix message with channel if provided
        const originalMessage = obj.message || '';
        const prefixedMessage = channel ? `[${channel.toUpperCase()}] ${originalMessage}` : originalMessage;
        // eslint-disable-next-line no-console
        console.info(JSON.stringify({ level: 'info', ...obj, message: prefixedMessage }));
      }
    : () => {},
  debug: ENABLE_DEBUG
    ? (obj: Record<string, unknown>, channel?: string) => {
        // Check channel if provided - early return to avoid object allocation
        if (channel && !isChannelEnabled(channel)) return;
        // Prefix message with channel if provided
        const originalMessage = obj.message || '';
        const prefixedMessage = channel ? `[${channel.toUpperCase()}] ${originalMessage}` : originalMessage;
        // eslint-disable-next-line no-console
        console.debug(JSON.stringify({ level: 'debug', ...obj, message: prefixedMessage }));
      }
    : () => {},
  isDebugChannelEnabled: ENABLE_DEBUG ? (channel: string) => isChannelEnabled(channel) : () => false,
};
