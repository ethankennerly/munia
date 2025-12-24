'use client';

import type { Command, ExecutionContext } from './command';

/**
 * Route command - navigates to a new path
 */
export class RouteCommand implements Command {
  type = 'route';

  timestamp: number;

  payload: {
    path: string;
  };

  constructor(data: { timestamp: number; payload: { path: string } }) {
    this.timestamp = data.timestamp;
    this.payload = data.payload;
  }

  execute(context: ExecutionContext): void {
    const { window } = context;
    const { path } = this.payload;
    // Navigate in the target window
    window.location.href = path;
  }
}

/**
 * Create a route command from action data
 */
export function createRouteCommand(data: { timestamp: number; payload: { path: string } }): RouteCommand {
  return new RouteCommand(data);
}
