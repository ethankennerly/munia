'use client';

import type { Command, ExecutionContext } from './commands';

/**
 * Command Player - executes commands in a given context
 *
 * This is the shared execution engine used by both:
 * - Live client (immediate execution)
 * - Replay player (timed execution)
 *
 * This ensures consistency between live and replay behavior.
 */
export class CommandPlayer {
  /**
   * Execute a single command in the given context
   */
  // eslint-disable-next-line class-methods-use-this
  executeCommand(command: Command, context: ExecutionContext): void {
    command.execute(context);
  }

  /**
   * Execute multiple commands sequentially
   * Useful for replay scenarios where commands need to execute in order
   */
  executeCommands(commands: Command[], context: ExecutionContext): void {
    for (const command of commands) {
      this.executeCommand(command, context);
    }
  }
}

/**
 * Default command player instance
 */
export const defaultCommandPlayer = new CommandPlayer();
