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

  // For buttons, use text content
  if (element.tagName === 'BUTTON' || role === 'button') {
    const text = element.textContent?.trim();
    if (text && text.length < 50) {
      return `button:contains("${text}")`;
    }
  }

  return null;
}

/**
 * Record a click event
 */
export function recordClick(event: MouseEvent): void {
  const config = getReplayConfig();
  if (!config.enabled) return;

  const { target } = event;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  // Don't record clicks on admin pages
  if (window.location.pathname.startsWith('/admin')) return;

  // Don't record clicks on the recording components themselves
  if (target.closest('[data-replay-recorder]')) return;

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
