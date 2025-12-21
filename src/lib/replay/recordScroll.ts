'use client';

import { recordAction } from './actionBuffer';
import { getReplayConfig } from './config';

// Track last recorded scroll position (normalized 0-1) to avoid redundant logs
let lastScrollYNormalized: number | null = null;
let lastScrollXNormalized: number | null = null;

/**
 * Calculate normalized scroll position (0-1 ratio of total scrollable area)
 * Returns null if there's no scrollable area (prevents spam from non-scrollable pages)
 */
function normalizeScroll(scrollY: number, scrollX: number): { normalizedY: number; normalizedX: number } | null {
  const documentHeight = document.documentElement.scrollHeight;
  const documentWidth = document.documentElement.scrollWidth;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Calculate maximum scrollable distance
  const maxScrollY = Math.max(0, documentHeight - viewportHeight);
  const maxScrollX = Math.max(0, documentWidth - viewportWidth);

  // Guard: If there's no scrollable area, return null (don't record)
  if (maxScrollY === 0 && maxScrollX === 0) {
    return null;
  }

  // Normalize to 0-1 (0 = top/left, 1 = bottom/right)
  const normalizedY = maxScrollY > 0 ? scrollY / maxScrollY : 0;
  const normalizedX = maxScrollX > 0 ? scrollX / maxScrollX : 0;

  return { normalizedY, normalizedX };
}

/**
 * Record scroll position if it changed significantly (>= threshold)
 * Records normalized scroll position (0-1 ratio) for size-independent replay
 * Zero overhead if scrollThreshold is not configured
 */
export function recordScroll(scrollY: number, scrollX: number = 0): void {
  const config = getReplayConfig();

  // Zero overhead: if scroll threshold not configured, do nothing
  if (config.scrollThreshold === undefined) {
    return;
  }

  const normalized = normalizeScroll(scrollY, scrollX);

  // Guard: If there's no scrollable area, don't record (prevents spam)
  if (normalized === null) {
    return;
  }

  const { normalizedY, normalizedX } = normalized;

  // Initialize on first call
  if (lastScrollYNormalized === null || lastScrollXNormalized === null) {
    lastScrollYNormalized = normalizedY;
    lastScrollXNormalized = normalizedX;
    return; // Don't record initial position
  }

  // Calculate delta in normalized space (0-1 range)
  // Threshold is already normalized (0-1 ratio) and clamped to minimum 0.01 (1%)
  const deltaY = Math.abs(normalizedY - lastScrollYNormalized);
  const deltaX = Math.abs(normalizedX - lastScrollXNormalized);

  // eslint-disable-next-line no-console
  console.log('[recordScroll] checking threshold', {
    scrollY,
    scrollX,
    normalizedY,
    normalizedX,
    lastScrollYNormalized,
    lastScrollXNormalized,
    deltaY,
    deltaX,
    thresholdNormalized: config.scrollThreshold,
    shouldRecord: deltaY >= config.scrollThreshold || deltaX >= config.scrollThreshold,
  });

  // Only record if scroll changed significantly (in normalized space)
  // Threshold is clamped to minimum 0.01 (1%) to prevent spam from tiny adjustments
  if (deltaY >= config.scrollThreshold || deltaX >= config.scrollThreshold) {
    // eslint-disable-next-line no-console
    console.log('[recordScroll] recording normalized scroll action', { normalizedY, normalizedX });
    recordAction({
      type: 'scroll',
      timestamp: Date.now(),
      data: {
        scrollY: normalizedY, // Store normalized 0-1 value, not pixels
        scrollX: normalizedX, // Store normalized 0-1 value, not pixels
      },
    });

    lastScrollYNormalized = normalizedY;
    lastScrollXNormalized = normalizedX;
  }
}
