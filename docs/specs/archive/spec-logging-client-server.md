# Client-Server Logging Integration

## Overview
Server-side npm loglevel (set via `npm run dev --loglevel warn`) controls client-side logging. When a log level is disabled, the corresponding client logging code is omitted at build time (tree-shaken).

## Log Levels
Four levels with strict ordering (same as server):
- `error` (0): Critical errors, failures, exceptions
- `warn` (1): Warnings, recoverable errors, deprecations
- `info` (2): Informational messages, feature checkpoints
- `debug` (3): Detailed execution flow, diagnostic information

**Ordering**: Lower numbers = higher priority. A level enables itself and all lower-numbered levels.

## Configuration

**Server Start**:
```bash
npm run dev --loglevel warn
npm run build --loglevel info
```

**Environment Variable**: npm sets `npm_config_loglevel` when using `--loglevel` flag. 

**Build-Time Evaluation**: The client logger evaluates loglevel at build time (not runtime) to enable tree-shaking. The constants (`ENABLE_DEBUG`, etc.) are evaluated once during build, then the bundler removes unused code entirely. No runtime variable access is needed - disabled code is omitted from the bundle.

**Next.js Requirement**: Next.js requires `NEXT_PUBLIC_*` prefix for client code to access environment variables during build. The `next.config.js` exposes `npm_config_loglevel` as `NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL` for build-time evaluation only (not for runtime access).

**Fallback**: If `npm_config_loglevel` is not set, defaults to `info` for production, `debug` for development/test.

## Implementation

### Client Logger (`src/lib/logging-client.ts`)

```typescript
// Build-time: Reads NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL (exposed from npm_config_loglevel via next.config.js)
// Next.js replaces NEXT_PUBLIC_* variables at build time
// Maps npm loglevels: silent/error -> 'error', warn -> 'warn', verbose/silly -> 'debug', default -> 'info'
function resolveLogLevel(): 'error' | 'warn' | 'info' | 'debug' {
  // Read from NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL (exposed by next.config.js from npm_config_loglevel)
  // Fallback to npm_config_loglevel for build-time access (may be available during build)
  const npmLevel = (process.env.NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL || process.env.npm_config_loglevel || '').toLowerCase();
  if (npmLevel === 'silent' || npmLevel === 'error') return 'error';
  if (npmLevel === 'warn') return 'warn';
  if (npmLevel === 'verbose' || npmLevel === 'silly') return 'debug';
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
  error: ENABLE_ERROR ? (obj: Record<string, unknown>) => console.error(JSON.stringify({ level: 'error', ...obj })) : () => {},
  warn: ENABLE_WARN ? (obj: Record<string, unknown>) => console.warn(JSON.stringify({ level: 'warn', ...obj })) : () => {},
  info: ENABLE_INFO ? (obj: Record<string, unknown>) => console.info(JSON.stringify({ level: 'info', ...obj })) : () => {},
  debug: ENABLE_DEBUG ? (obj: Record<string, unknown>) => console.debug(JSON.stringify({ level: 'debug', ...obj })) : () => {},
};
```

**Key Points**:
- Reads from `NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL` at build time only (exposed by `next.config.js` from `npm_config_loglevel`)
- Build-time constants (`ENABLE_DEBUG`, etc.) are evaluated once during build
- Disabled logger functions become no-ops, which the bundler tree-shakes (removes entirely from bundle)
- No runtime variable access needed - all evaluation happens at build time
- Maps npm loglevels: `silent`/`error` → `error`, `warn` → `warn`, `verbose`/`silly` → `debug`, default → `info`
- Each logger method uses the matching `console` method (`console.error` for `error`, `console.warn` for `warn`, `console.info` for `info`, `console.debug` for `debug`)
- All `logger.debug()` calls are completely removed from bundle when loglevel is `info` or below (not just disabled, but omitted entirely)

## Usage

### Client Components
```typescript
'use client';
import { logger } from '@/lib/logging-client';

logger.debug({ message: '[Component] effect', userId: userId });
logger.info({ message: '[Component] checkpoint' });
logger.warn({ message: '[Component] warning' });
logger.error({ message: '[Component] error', error: error });
```

## Tree-Shaking

**Input** (when `npm run dev --loglevel info`):
```typescript
logger.debug({ message: 'trace', data: largeObject }); // Removed
logger.info({ message: 'checkpoint' }); // Kept
logger.error({ message: 'failure' }); // Kept
```

**Result**: `logger.debug()` calls and their arguments are completely removed from the bundle.

## Constraints

1. **Build-Time Only**: Log level must be set at build time via npm `--loglevel` flag
2. **Restart Required**: Changing loglevel requires rebuilding
3. **No Runtime Changes**: Cannot change log level at runtime (by design, for optimization)

