'use client';

import { recordAction } from './actionBuffer';
import { getReplayConfig } from './config';

/**
 * Get a stable selector for an element
 */
function getSelector(element: HTMLElement): string | null {
  // Prefer data-testid
  const { testid } = element.dataset;
  if (testid) {
    return `[data-testid="${testid}"]`;
  }

  // Prefer role-based selector
  const role = element.getAttribute('role');
  if (role) {
    const name = element.getAttribute('aria-label') || element.textContent?.trim();
    if (name) {
      return `[role="${role}"][aria-label="${name}"]`;
    }
  }

  // For links, use href
  if (element.tagName === 'A' && element instanceof HTMLAnchorElement) {
    const href = element.getAttribute('href');
    if (href) {
      return `a[href="${href}"]`;
    }
  }

  // For buttons (including submit buttons), use text content or type
  if (element.tagName === 'BUTTON' || role === 'button') {
    const text = element.textContent?.trim();
    if (text && text.length < 50) {
      return `button:contains("${text}")`;
    }
    // Fallback: use button type if available
    const type = element.getAttribute('type');
    if (type) {
      return `button[type="${type}"]`;
    }
  }

  // For input submit buttons
  if (element.tagName === 'INPUT' && element instanceof HTMLInputElement) {
    const { type, value } = element;
    if (type === 'submit' || type === 'button') {
      if (value) {
        return `input[type="${type}"][value="${value}"]`;
      }
      return `input[type="${type}"]`;
    }
  }

  return null;
}

/**
 * Record a click or keyboard activation event
 */
export function recordClick(event: MouseEvent | KeyboardEvent): void {
  const config = getReplayConfig();
  if (!config.enabled) return;

  const { target } = event;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  // Don't record on admin pages
  if (window.location.pathname.startsWith('/admin')) return;

  // Don't record on the recording components themselves
  if (target.closest('[data-replay-recorder]')) return;

  // For keyboard events, only record Enter or Space on interactive elements
  if (event instanceof KeyboardEvent) {
    const { key } = event;
    if (key !== 'Enter' && key !== ' ') {
      return;
    }
    // Only record if the element is focusable/interactive
    const isInteractive =
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.getAttribute('role') === 'button' ||
      target.getAttribute('tabindex') !== null;
    if (!isInteractive) {
      return;
    }
  }

  const selector = getSelector(target);
  if (!selector) return; // Skip if we can't create a stable selector

  // Get target URL if it's a link (extract pathname only, no domain)
  let targetPath: string | undefined;
  if (target.tagName === 'A' && target instanceof HTMLAnchorElement) {
    targetPath = target.pathname;
  } else {
    const link = target.closest('a');
    if (link instanceof HTMLAnchorElement) {
      targetPath = link.pathname;
    }
  }

  recordAction({
    type: 'click',
    timestamp: Date.now(),
    data: {
      selector, // Will be encoded as 's'
      target: targetPath || target.tagName.toLowerCase(), // Will be encoded as 'tg' (pathname only)
    },
  });
}
