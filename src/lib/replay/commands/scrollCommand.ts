'use client';

import type { Command, ExecutionContext } from './command';

/**
 * Scroll command - scrolls to a normalized position (0-1 ratio)
 */
export class ScrollCommand implements Command {
  type = 'scroll';

  timestamp: number;

  payload: {
    scrollY: number; // Normalized 0-1 ratio
    scrollX: number; // Normalized 0-1 ratio
  };

  constructor(data: { timestamp: number; payload: { scrollY: number; scrollX: number } }) {
    this.timestamp = data.timestamp;
    this.payload = data.payload;
  }

  execute(context: ExecutionContext): void {
    const { window } = context;
    const { scrollY: normalizedY, scrollX: normalizedX } = this.payload;

    // Get target window's scrollable dimensions
    const doc = window.document.documentElement;
    const maxScrollY = Math.max(0, doc.scrollHeight - window.innerHeight);
    const maxScrollX = Math.max(0, doc.scrollWidth - window.innerWidth);

    // Convert normalized position back to pixels
    const scrollY = normalizedY * maxScrollY;
    const scrollX = normalizedX * maxScrollX;

    window.scrollTo({ top: scrollY, left: scrollX, behavior: 'auto' });
  }
}

/**
 * Create a scroll command from action data
 */
export function createScrollCommand(data: {
  timestamp: number;
  payload: { scrollY: number; scrollX: number };
}): ScrollCommand {
  return new ScrollCommand(data);
}
