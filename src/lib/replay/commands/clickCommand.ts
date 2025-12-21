'use client';

import type { Command, ExecutionContext } from './command';

/**
 * Click command - executes a click on an element
 */
export class ClickCommand implements Command {
  type = 'click';
  timestamp: number;
  payload: {
    selector: string;
    target: string;
  };

  constructor(data: { timestamp: number; payload: { selector: string; target: string } }) {
    this.timestamp = data.timestamp;
    this.payload = data.payload;
  }

  execute(context: ExecutionContext): void {
    const { document } = context;
    const { selector, target } = this.payload;

    // Try to find element by selector
    let element: HTMLElement | null = null;

    // Handle different selector types
    if (selector.startsWith('[data-testid=')) {
      const testId = selector.match(/data-testid="([^"]+)"/)?.[1];
      if (testId) {
        element = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
      }
    } else if (selector.startsWith('a[href=')) {
      const href = selector.match(/href="([^"]+)"/)?.[1];
      if (href) {
        element = document.querySelector(`a[href="${href}"]`) as HTMLElement;
      }
    } else if (selector.startsWith('[role=')) {
      // Try to match role and aria-label
      const roleMatch = selector.match(/role="([^"]+)"/);
      const labelMatch = selector.match(/aria-label="([^"]+)"/);
      if (roleMatch && labelMatch) {
        const role = roleMatch[1];
        const label = labelMatch[1];
        element = document.querySelector(`[role="${role}"][aria-label="${label}"]`) as HTMLElement;
      }
    } else if (selector.startsWith('button:contains(')) {
      const text = selector.match(/contains\("([^"]+)"/)?.[1];
      if (text) {
        // Find button with matching text
        const buttons = Array.from(document.querySelectorAll('button'));
        element = buttons.find((btn) => btn.textContent?.trim() === text) || null;
      }
    } else if (selector.startsWith('button[type=')) {
      const type = selector.match(/type="([^"]+)"/)?.[1];
      if (type) {
        element = document.querySelector(`button[type="${type}"]`) as HTMLElement;
      }
    } else if (selector.startsWith('input[type=')) {
      const typeMatch = selector.match(/type="([^"]+)"/);
      const valueMatch = selector.match(/value="([^"]+)"/);
      if (typeMatch) {
        const type = typeMatch[1];
        if (valueMatch) {
          const value = valueMatch[1];
          element = document.querySelector(`input[type="${type}"][value="${value}"]`) as HTMLElement;
        } else {
          element = document.querySelector(`input[type="${type}"]`) as HTMLElement;
        }
      }
    }

    // If element found, click it
    if (element) {
      element.click();
    } else if (typeof target === 'string' && target.startsWith('/')) {
      // Fallback: if target is a path, navigate to it
      context.window.location.href = target;
    }
  }
}

/**
 * Create a click command from action data
 */
export function createClickCommand(data: {
  timestamp: number;
  payload: { selector: string; target: string };
}): ClickCommand {
  return new ClickCommand(data);
}

