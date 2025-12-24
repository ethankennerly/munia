'use client';

import type { Command, ExecutionContext } from './command';

/**
 * Activate command - executes an activation on an element
 * Activation includes: click, tap, Enter key, Space key
 */
export class ActivateCommand implements Command {
  type = 'activate';
  timestamp: number;
  payload: {
    selector: string;
  };

  constructor(data: { timestamp: number; payload: { selector: string } }) {
    this.timestamp = data.timestamp;
    this.payload = data.payload;
  }

  execute(context: ExecutionContext): void {
    const { document } = context;
    const { selector } = this.payload;

    // selector is the activation ID (data-activate-id value)
    // Find element by data-activate-id attribute
    const element = document.querySelector(`[data-activate-id="${selector}"]`) as HTMLElement | null;

    // If element found, activate it (click)
    if (element) {
      element.click();
    }
  }
}

/**
 * Create an activate command from action data
 */
export function createActivateCommand(data: {
  timestamp: number;
  payload: { selector: string };
}): ActivateCommand {
  return new ActivateCommand(data);
}

