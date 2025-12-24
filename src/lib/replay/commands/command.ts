/**
 * Command Pattern for Session Replay
 *
 * Commands encapsulate user actions and can be executed both:
 * - Immediately (live client)
 * - With timing (replay player)
 *
 * This ensures consistency between live and replay behavior.
 */

/**
 * Execution context for commands
 */
export interface ExecutionContext {
  window: Window;
  document: Document;
}

/**
 * Base command interface
 */
export interface Command {
  /**
   * Command type (e.g., 'activate', 'route', 'scroll')
   */
  type: string;

  /**
   * Timestamp when the command was created (milliseconds since epoch)
   */
  timestamp: number;

  /**
   * Command payload (type-specific data)
   */
  payload: Record<string, unknown>;

  /**
   * Execute the command in the given context
   */
  execute(context: ExecutionContext): void;
}

/**
 * Command factory function type
 */
export type CommandFactory<T extends Command = Command> = (data: {
  timestamp: number;
  payload: Record<string, unknown>;
}) => T;
