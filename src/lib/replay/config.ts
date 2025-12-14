/*
 * Session Replay config helpers (client + server safe)
 * Reads env and provides typed, minimal configuration with sane defaults.
 */

// In the browser, Next.js exposes only NEXT_PUBLIC_* envs. Keep both for flexibility in tests.
function readEnv(name: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) return process.env[name];
  return undefined;
}

export type ReplayConfig = {
  enabled: boolean;
  privateSelectors: string[]; // CSS selectors to mask
  retentionDays: number; // storage TTL target; informational at this layer
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
  const enabled = parseBoolean(readEnv('NEXT_PUBLIC_REPLAY_ENABLED') ?? readEnv('REPLAY_ENABLED'), false);
  const privateSelectors = parseCsv(
    readEnv('NEXT_PUBLIC_REPLAY_PRIVATE_SELECTORS') ?? readEnv('REPLAY_PRIVATE_SELECTORS'),
  );
  // Default retention window: 10 days (spec allows 7–14). Clamp to 1..365.
  const retentionDaysRaw = parseNumber(
    readEnv('NEXT_PUBLIC_REPLAY_RETENTION_DAYS') ?? readEnv('REPLAY_RETENTION_DAYS'),
    10,
  );
  const retentionDays = Math.max(1, Math.min(365, retentionDaysRaw));
  return { enabled, privateSelectors, retentionDays };
}
