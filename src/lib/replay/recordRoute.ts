'use client';

import { recordCommand } from './commandBuffer';
import { createRouteCommand } from './commands/routeCommand';
import { getReplayConfig } from './config';

/**
 * Record a route change
 */
export function recordRoute(path: string): void {
  const config = getReplayConfig();
  if (!config.enabled) return;

  // Don't record admin routes
  if (path.startsWith('/admin')) return;

  const command = createRouteCommand({
    timestamp: Date.now(),
    payload: { path },
  });

  recordCommand(command);
}
