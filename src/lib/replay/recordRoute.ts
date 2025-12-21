'use client';

import { recordAction } from './actionBuffer';
import { getReplayConfig } from './config';

/**
 * Record a route change
 */
export function recordRoute(path: string): void {
  const config = getReplayConfig();
  if (!config.enabled) return;

  // Don't record admin routes
  if (path.startsWith('/admin')) return;

  recordAction({
    type: 'route',
    timestamp: Date.now(),
    data: { path },
  });
}
