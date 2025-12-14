/*
 * Minimal, testable capture initializer for Session Replay (no rrweb yet).
 * - Respects the feature flag from config.
 * - Provides start/stop/record/flush APIs and keeps an in-memory buffer.
 * - No network or DOM side effects in this first step.
 */

import { getReplayConfig } from './config';

export type ReplayEvent = {
  t: number; // epoch ms
  type: string; // placeholder event type
  data?: unknown;
};

type State = {
  enabled: boolean;
  running: boolean;
  buffer: ReplayEvent[];
};

const state: State = {
  enabled: false,
  running: false,
  buffer: [],
};

function ensureConfigLoaded() {
  if (state.enabled === false && state.running === false && state.buffer.length === 0) {
    const cfg = getReplayConfig();
    state.enabled = !!cfg.enabled;
  }
}

export function isEnabled(): boolean {
  ensureConfigLoaded();
  return state.enabled;
}

export function start(): boolean {
  ensureConfigLoaded();
  if (!state.enabled) return false;
  state.running = true;
  return true;
}

export function stop(): void {
  state.running = false;
}

// For now, allow tests or future recorder to push synthetic events
export function record(event: Omit<ReplayEvent, 't'> & { t?: number }): void {
  if (!state.enabled || !state.running) return;
  const t = typeof event.t === 'number' ? event.t : Date.now();
  state.buffer.push({ t, type: event.type, data: event.data });
}

export function flush(): ReplayEvent[] {
  const out = state.buffer.slice();
  state.buffer.length = 0;
  return out;
}

export function resetForTests(): void {
  state.enabled = false;
  state.running = false;
  state.buffer = [];
}
