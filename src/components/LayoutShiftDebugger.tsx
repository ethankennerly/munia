'use client';

import { useEffect } from 'react';

/**
 * Diagnostic component: logs every layout-shift entry with source attribution.
 * Add to a page temporarily to identify CLS culprits, then remove.
 *
 * Uses the Layout Instability API:
 * https://web.dev/articles/debug-layout-shifts
 */
export function LayoutShiftDebugger() {
  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
          sources?: Array<{
            node?: Node | null;
            previousRect: DOMRectReadOnly;
            currentRect: DOMRectReadOnly;
          }>;
        };

        // Skip shifts caused by user input (these don't count toward CLS)
        if (layoutShift.hadRecentInput) continue;

        const sources = layoutShift.sources ?? [];
        const sourceDetails = sources.map((source) => {
          const node = source.node;
          let selector = '(unknown)';
          if (node instanceof Element) {
            selector = node.tagName.toLowerCase();
            if (node.id) selector += `#${node.id}`;
            if (node.className && typeof node.className === 'string') {
              selector += `.${node.className.split(/\s+/).join('.')}`;
            }
            // Also capture inline style for identifying the padding-top:16px div
            const style = node.getAttribute('style');
            if (style) selector += ` [style="${style}"]`;
          }
          return {
            selector,
            previousRect: rectToObj(source.previousRect),
            currentRect: rectToObj(source.currentRect),
            deltaY: source.currentRect.y - source.previousRect.y,
            deltaX: source.currentRect.x - source.previousRect.x,
          };
        });

        console.warn('[CLS DEBUG] Layout shift detected', {
          score: layoutShift.value,
          startTime: layoutShift.startTime,
          sources: sourceDetails,
        });
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    return () => observer.disconnect();
  }, []);

  return null;
}

function rectToObj(rect: DOMRectReadOnly) {
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
}
