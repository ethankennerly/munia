type Level = 'error' | 'warn' | 'info' | 'debug';

function resolveLevel(): Level {
  // In tests, enable verbose logging so spies on console methods work reliably
  if (process.env.NODE_ENV === 'test' || process.env.VITEST_WORKER_ID) return 'debug';
  const fromEnv = (process.env.MUNIA_LOG_LEVEL || '').toLowerCase();
  if (fromEnv === 'error' || fromEnv === 'warn' || fromEnv === 'info' || fromEnv === 'debug') return fromEnv;
  const npm = (process.env.npm_config_loglevel || '').toLowerCase();
  if (npm === 'silent' || npm === 'error') return 'error';
  if (npm === 'warn') return 'warn';
  if (npm === 'verbose' || npm === 'silly') return 'debug';
  return 'info';
}

function resolveChannels(): Set<string> {
  const fromEnv = process.env.NEXT_PUBLIC_LOG_CHANNELS || '';
  if (!fromEnv) return new Set();
  // Parse comma-separated channel names (e.g., "SCROLL,API,DB")
  return new Set(fromEnv.split(',').map((ch) => ch.trim().toUpperCase()));
}

const order: Record<Level, number> = { error: 0, warn: 1, info: 2, debug: 3 };
const current = resolveLevel();
const enabledChannels = resolveChannels();

function enabled(level: Level) {
  return order[level] <= order[current];
}

function isChannelEnabled(channel: string): boolean {
  // If no channels are configured, all channels are enabled (backward compatibility)
  if (enabledChannels.size === 0) return true;
  return enabledChannels.has(channel.toUpperCase());
}

function base(level: Level, obj: Record<string, unknown>, channel?: string) {
  if (!enabled(level)) return;

  // Check channel if provided - early return to avoid object allocation
  if (channel && !isChannelEnabled(channel)) return;

  const method: 'error' | 'warn' | 'log' = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  // Prefix message with channel if provided
  const originalMessage = obj.message || '';
  const prefixedMessage = channel ? `[${channel.toUpperCase()}] ${originalMessage}` : originalMessage;
  // eslint-disable-next-line no-console
  console[method](JSON.stringify({ level, ...obj, message: prefixedMessage }));
}

export const logger = {
  error: (obj: Record<string, unknown>, channel?: string) => base('error', obj, channel),
  warn: (obj: Record<string, unknown>, channel?: string) => base('warn', obj, channel),
  info: (obj: Record<string, unknown>, channel?: string) => base('info', obj, channel),
  debug: (obj: Record<string, unknown>, channel?: string) => base('debug', obj, channel),
};
