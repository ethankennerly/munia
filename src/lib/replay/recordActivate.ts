'use client';

import { recordCommand } from './commandBuffer';
import { createActivateCommand } from './commands/activateCommand';
import { getReplayConfig } from './config';

/**
 * Get activation ID from event path
 * Uses event.composedPath() to reliably find the interactive element that was clicked
 * Handles cases where click target is a child element (icon, text, SVG) by checking the event path
 */
function getActivateIdFromEvent(event: MouseEvent | KeyboardEvent): string | null {
  // Use composedPath() to get the complete event path (more reliable than parent traversal)
  const path = event.composedPath ? event.composedPath() : [];

  // Check each element in the path from target to root
  for (const element of path) {
    if (!(element instanceof HTMLElement)) {
      continue;
    }

    // Check if this element is interactive
    const isInteractive =
      element.tagName === 'BUTTON' || element.tagName === 'A' || element.getAttribute('role') === 'button';

    if (isInteractive) {
      const id = element.getAttribute('data-activate-id');
      if (id) {
        return id;
      }
      // Found interactive element but no ID - stop searching (shouldn't record)
      return null;
    }
  }

  return null;
}

/**
 * Record an activation event (click, tap, Enter, or Space)
 * Only records if element has data-activate-id attribute
 */
export function recordActivate(event: MouseEvent | KeyboardEvent): void {
  const config = getReplayConfig();
  if (!config.enabled) return;

  const { target } = event;
  // Handle both HTMLElement and SVGElement (SVG elements can be clicked)
  if (!(target instanceof HTMLElement) && !(target instanceof SVGElement) && !(target instanceof Element)) {
    return;
  }

  // Don't record on admin pages
  if (window.location.pathname.startsWith('/admin')) return;

  // Don't record on the recording components themselves
  if (target instanceof Element && target.closest('[data-replay-recorder]')) return;

  // For keyboard events, only record Enter or Space on interactive elements
  if (event instanceof KeyboardEvent) {
    const { key } = event;
    if (key !== 'Enter' && key !== ' ') {
      return;
    }
    // Only record if the element is focusable/interactive
    const isInteractive =
      target instanceof HTMLElement &&
      (target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.getAttribute('role') === 'button' ||
        target.getAttribute('tabindex') !== null);
    if (!isInteractive) {
      return;
    }
  }

  // Use event path to reliably find the activation ID
  // This handles cases where click target is a child element (icon, SVG, text)
  const activateId = getActivateIdFromEvent(event);
  if (!activateId) {
    return; // Skip recording if no activation ID
  }

  const command = createActivateCommand({
    timestamp: Date.now(),
    payload: {
      selector: activateId, // Activation ID only (will be encoded as 's')
    },
  });

  recordCommand(command);
}
