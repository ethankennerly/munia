'use client';

import { useEffect, useRef } from 'react';
import { recordScroll } from '@/lib/replay/recordScroll';
import { getReplayConfig } from '@/lib/replay/config';
import { useSession } from 'next-auth/react';
import { useReplayContext } from '@/lib/replay/replayContext';
import { initCommandBuffer } from '@/lib/replay/commandBuffer';
import { logger } from '@/lib/logging-client';

/**
 * Records scroll events for session replay.
 * Only records significant scroll changes (>= threshold) to minimize log data.
 * Records scroll position before clicks to show context.
 * Zero overhead when NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED is not set.
 */
export function ScrollRecorder() {
  const { data: session } = useSession();
  const config = getReplayConfig();
  const { isReplaying } = useReplayContext();
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestScrollRef = useRef<{ scrollY: number; scrollX: number }>({ scrollY: 0, scrollX: 0 });

  // Extract stable values for dependencies
  const scrollThreshold = config.scrollThreshold;
  const enabled = config.enabled;
  const userId = session?.user?.id;

  useEffect(() => {
    // Zero overhead: if scroll threshold not configured, don't add listeners
    if (scrollThreshold === undefined) {
      return undefined;
    }

    // Don't record during replay
    if (isReplaying) {
      return undefined;
    }

    // Only record if enabled and user is authenticated
    if (!enabled || !userId) {
      return undefined;
    }

    // Initialize command buffer to ensure session ID is created before any scroll commands
    // This ensures scroll commands use the same session ID as route/activate commands
    initCommandBuffer();

    const handleScroll = () => {
      // Get scroll position from window (works for both window and document scrolling)
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const scrollX = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || 0;

      // Update latest scroll position
      latestScrollRef.current = { scrollY, scrollX };

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }

      const timeoutId = setTimeout(() => {
        const { scrollY: finalY, scrollX: finalX } = latestScrollRef.current;
        
        // Verify timeout wasn't cleared
        if (scrollTimeoutRef.current !== timeoutId) {
          logger.warn({message: '[ScrollRecorder] timeout ID mismatch - timeout was cleared',
            expected: timeoutId,
            actual: scrollTimeoutRef.current
          });
          return;
        }
        
        try {
          recordScroll(finalY, finalX);
        } catch (error) {
          logger.error({message: '[ScrollRecorder] error in recordScroll', error: error });
        }
        scrollTimeoutRef.current = null;
      }, 200);
      
      scrollTimeoutRef.current = timeoutId;
    };

    // Listen to scroll on both window and document (covers all scroll scenarios)
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [enabled, scrollThreshold, userId, isReplaying]);

  return null;
}
