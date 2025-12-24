/**
 * Command exports
 */

export type { Command, ExecutionContext, CommandFactory } from './command';
export { ActivateCommand, createActivateCommand } from './activateCommand';
export { RouteCommand, createRouteCommand } from './routeCommand';
export { ScrollCommand, createScrollCommand } from './scrollCommand';

/**
 * Create a command from decoded action data
 */
import type { Action } from '@/lib/replay/encoding';
import { createActivateCommand } from './activateCommand';
import { createRouteCommand } from './routeCommand';
import { createScrollCommand } from './scrollCommand';
import type { Command } from './command';

export function createCommandFromAction(action: Action): Command {
  switch (action.type) {
    case 'activate':
      return createActivateCommand({
        timestamp: action.timestamp,
        payload: {
          selector: action.data.selector as string,
        },
      });
    case 'route':
      return createRouteCommand({
        timestamp: action.timestamp,
        payload: {
          path: action.data.path as string,
        },
      });
    case 'scroll':
      return createScrollCommand({
        timestamp: action.timestamp,
        payload: {
          scrollY: action.data.scrollY as number,
          scrollX: (action.data.scrollX as number) || 0,
        },
      });
    default:
      throw new Error(`Unknown command type: ${action.type}`);
  }
}

