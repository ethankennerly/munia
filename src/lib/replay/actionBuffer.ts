'use client';

import { v4 as uuidv4 } from 'uuid';
import { encodeAction, type Action, type EncodedAction } from './encoding';

let actionBuffer: EncodedAction[] = [];
let sessionId: string | null = null;
let flushTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Flush actions to server
 */
async function flushActions(): Promise<void> {
  if (actionBuffer.length === 0 || !sessionId) return;

  const actions = actionBuffer.splice(0);

  try {
    const res = await fetch('/api/replay/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        actions,
      }),
    });

    if (!res.ok) {
      // Put actions back in buffer to retry later
      actionBuffer.unshift(...actions);
    }
  } catch {
    // Put actions back in buffer to retry later
    actionBuffer.unshift(...actions);
  }
}

/**
 * Record an action for session replay
 */
export function recordAction(action: Action): void {
  if (!sessionId) {
    sessionId = uuidv4();
  }

  const encoded = encodeAction(action);
  actionBuffer.push(encoded);

  // Upload every 5 seconds or when buffer reaches 10 actions
  if (actionBuffer.length >= 10) {
    flushActions();
  }
}

/**
 * Get current session ID
 */
export function getSessionId(): string | null {
  return sessionId;
}

/**
 * Initialize periodic flushing
 */
export function initActionBuffer(): void {
  if (typeof window === 'undefined') return;

  // Flush every 5 seconds
  if (!flushTimer) {
    flushTimer = setInterval(flushActions, 5000);
  }

  // Flush on page unload
  window.addEventListener('beforeunload', flushActions);
}

/**
 * Cleanup (for testing)
 */
export function resetActionBuffer(): void {
  actionBuffer = [];
  sessionId = null;
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}
