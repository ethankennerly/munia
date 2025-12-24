'use client';

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logging-client';
import { encodeAction, type Action, type EncodedAction } from './encoding';
import type { Command } from './commands';

/**
 * Command Buffer - stores commands and uploads them to the server
 *
 * This replaces actionBuffer.ts and uses the command pattern.
 * Commands are encoded before storage/transmission.
 */
let commandBuffer: EncodedAction[] = [];
let sessionId: string | null = null;
let flushTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Flush commands to server
 */
async function flushCommands(): Promise<void> {
  if (commandBuffer.length === 0 || !sessionId) return;

  const commands = commandBuffer.splice(0);

  try {
    const res = await fetch('/api/replay/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        actions: commands,
      }),
    });

    if (!res.ok) {
      // Put commands back in buffer to retry later
      commandBuffer.unshift(...commands);
    }
  } catch {
    // Put commands back in buffer to retry later
    commandBuffer.unshift(...commands);
  }
}

/**
 * Record a command for session replay
 * Commands are encoded before being added to the buffer
 *
 * IMPORTANT: Session ID is created on first call. Ensure initCommandBuffer()
 * is called early to guarantee all commands use the same session ID.
 */
export function recordCommand(command: Command): void {
  if (!sessionId) {
    sessionId = uuidv4();
    logger.debug({ message: '[commandBuffer] session ID created', sessionId });
  }

  // Convert command to action format for encoding
  const action: Action = {
    type: command.type,
    timestamp: command.timestamp,
    data: command.payload,
  };

  const encoded = encodeAction(action);
  commandBuffer.push(encoded);

  // Upload every 5 seconds or when buffer reaches 10 commands
  if (commandBuffer.length >= 10) {
    flushCommands();
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
 *
 * IMPORTANT: Call this early (e.g., in RouteRecorder or ScrollRecorder)
 * to ensure the session ID is initialized before any commands are recorded.
 * This guarantees all commands (route, activate, scroll) use the same session ID.
 */
export function initCommandBuffer(): void {
  if (typeof window === 'undefined') return;

  // Initialize session ID if not already set
  // This ensures all commands use the same session ID, even if scroll events
  // fire before route changes
  if (!sessionId) {
    sessionId = uuidv4();
    logger.debug({ message: '[commandBuffer] initialized with session ID', sessionId });
  }

  // Flush every 5 seconds
  if (!flushTimer) {
    flushTimer = setInterval(flushCommands, 5000);
  }

  // Flush on page unload
  window.addEventListener('beforeunload', flushCommands);
}

/**
 * Cleanup (for testing)
 */
export function resetCommandBuffer(): void {
  commandBuffer = [];
  sessionId = null;
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}
