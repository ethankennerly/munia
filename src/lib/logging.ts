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

const order: Record<Level, number> = { error: 0, warn: 1, info: 2, debug: 3 };
const current = resolveLevel();

function enabled(level: Level) {
  return order[level] <= order[current];
}

function base(level: Level, obj: Record<string, unknown>) {
  if (!enabled(level)) return;
  const method: 'error' | 'warn' | 'log' = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  // eslint-disable-next-line no-console
  console[method](JSON.stringify({ level, ...obj }));
}

export const logger = {
  error: (obj: Record<string, unknown>) => base('error', obj),
  warn: (obj: Record<string, unknown>) => base('warn', obj),
  info: (obj: Record<string, unknown>) => base('info', obj),
  debug: (obj: Record<string, unknown>) => base('debug', obj),
};
