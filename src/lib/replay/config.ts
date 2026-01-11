/*
 * Session Replay config helpers (client + server safe)
 * Reads env and provides typed, minimal configuration with sane defaults.
 */

// In the browser, Next.js exposes only NEXT_PUBLIC_* envs. Keep both for flexibility in tests.
function readEnv(name: string): string | undefined {
  // Next.js replaces process.env.NEXT_PUBLIC_* at build time
  // In browser, process.env exists but may be a proxy, so we need to access it directly
  try {
    if (typeof process !== 'undefined' && process.env) {
      const value = process.env[name];
      if (value !== undefined && value !== null) {
        return String(value);
      }
    }
  } catch {
    // Ignore errors accessing process.env
  }
  return undefined;
}

export type ReplayConfig = {
  enabled: boolean;
  privateSelectors: string[]; // CSS selectors to mask
  retentionDays: number; // storage TTL target; informational at this layer
  scrollThreshold?: number; // Normalized threshold (0-1 ratio), e.g., 0.1 = 10% of scrollable area. If undefined, scroll recording is disabled (zero overhead)
};

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value == null) return fallback;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (value == null) return fallback;
  const n = Number(value);
  // Accept any finite number (including negatives); clamp happens later
  return Number.isFinite(n) ? n : fallback;
}

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function getReplayConfig(): ReplayConfig {
  // Prefer NEXT_PUBLIC_* so it works on the client as well.
  // Next.js replaces process.env.NEXT_PUBLIC_REPLAY_ENABLED at build time
  // Access it directly - Next.js will replace this with the actual value
  let replayEnabled: string | undefined;
  try {
    // Direct access - Next.js replaces this at build time
    replayEnabled =
      typeof process !== 'undefined' && process.env
        ? process.env.NEXT_PUBLIC_REPLAY_ENABLED ?? process.env.REPLAY_ENABLED
        : undefined;
  } catch {
    replayEnabled = undefined;
  }
  const enabled = parseBoolean(replayEnabled, false);
  const privateSelectors = parseCsv(
    readEnv('NEXT_PUBLIC_REPLAY_PRIVATE_SELECTORS') ?? readEnv('REPLAY_PRIVATE_SELECTORS'),
  );
  // Default retention window: 10 days (spec allows 7–14). Clamp to 1..365.
  const retentionDaysRaw = parseNumber(
    readEnv('NEXT_PUBLIC_REPLAY_RETENTION_DAYS') ?? readEnv('REPLAY_RETENTION_DAYS'),
    10,
  );
  const retentionDays = Math.max(1, Math.min(365, retentionDaysRaw));

  // Scroll threshold: normalized value (0-1 ratio), e.g., 0.1 = record when scroll changes by 10% of scrollable area
  // If not set, scroll recording is disabled (zero overhead)
  // Access directly like NEXT_PUBLIC_REPLAY_ENABLED (Next.js replaces at build time)
  let scrollThresholdStr: string | undefined;
  try {
    scrollThresholdStr =
      typeof process !== 'undefined' && process.env
        ? process.env.NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED ??
          process.env.REPLAY_SCROLL_THRESHOLD_NORMALIZED ??
          process.env.NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD ?? // Legacy support
          process.env.REPLAY_SCROLL_THRESHOLD // Legacy support
        : undefined;
  } catch {
    scrollThresholdStr = undefined;
  }
  // Parse as normalized value (0-1), clamp to valid range
  // Minimum threshold: 0.01 (1%) to prevent spam from tiny adjustments
  // Maximum threshold: 1.0 (100%) - no point recording if threshold is 100%
  const scrollThresholdRaw = scrollThresholdStr ? parseNumber(scrollThresholdStr, 0.1) : undefined;
  const scrollThreshold =
    scrollThresholdRaw !== undefined ? Math.max(0.01, Math.min(1, scrollThresholdRaw)) : undefined;

  return { enabled, privateSelectors, retentionDays, scrollThreshold };
}
