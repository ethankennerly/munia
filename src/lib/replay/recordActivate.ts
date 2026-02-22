'use client';

function getActivateIdFromEvent(event: MouseEvent | KeyboardEvent): string | null {
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
export function recordActivate(event: MouseEvent | KeyboardEvent): string | null {
  const { target } = event;
  // Handle both HTMLElement and SVGElement (SVG elements can be clicked)
  if (!(target instanceof HTMLElement) && !(target instanceof SVGElement) && !(target instanceof Element)) {
    return null;
  }

  // Don't record on admin pages
  if (window.location.pathname.startsWith('/admin')) return null;

  // Don't record on the recording components themselves
  if (target instanceof Element && target.closest('[data-replay-recorder]')) return null;

  // For keyboard events, only record Enter or Space on interactive elements
  if (event instanceof KeyboardEvent) {
    const { key } = event;
    if (key !== 'Enter' && key !== ' ') {
      return null;
    }
    // Only record if the element is focusable/interactive
    const isInteractive =
      target instanceof HTMLElement &&
      (target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.getAttribute('role') === 'button' ||
        target.getAttribute('tabindex') !== null);
    if (!isInteractive) {
      return null;
    }
  }

  return getActivateIdFromEvent(event);
}
