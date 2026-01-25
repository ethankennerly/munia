'use client';

export type DebugLogPayload = {
  location: string;
  message: string;
  data?: Record<string, unknown>;
  hypothesisId?: string;
};

export function sendDebugLog(payload: DebugLogPayload): void {
  if (typeof window === 'undefined') return;
  const body = {
    location: payload.location,
    message: payload.message,
    data: payload.data ?? {},
    timestamp: Date.now(),
    hypothesisId: payload.hypothesisId ?? null,
  };
  fetch('/api/debug/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}
