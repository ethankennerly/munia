'use client';

import { useEffect, useRef } from 'react';
import { recordScroll } from '@/lib/replay/recordScroll';
import { getReplayConfig } from '@/lib/replay/config';
import { useSession } from 'next-auth/react';
import { useReplayContext } from '@/lib/replay/replayContext';

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

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[ScrollRecorder] effect', {
      scrollThreshold: config.scrollThreshold,
      enabled: config.enabled,
      isReplaying,
      userId: session?.user?.id,
    });

    // Zero overhead: if scroll threshold not configured, don't add listeners
    if (config.scrollThreshold === undefined) {
      // eslint-disable-next-line no-console
      console.log('[ScrollRecorder] disabled - scrollThreshold undefined');
      return undefined;
    }

    // Don't record during replay
    if (isReplaying) {
      // eslint-disable-next-line no-console
      console.log('[ScrollRecorder] disabled - replaying');
      return undefined;
    }

    // Only record if enabled and user is authenticated
    if (!config.enabled || !session?.user?.id) {
      // eslint-disable-next-line no-console
      console.log('[ScrollRecorder] disabled - not enabled or no user', {
        enabled: config.enabled,
        userId: session?.user?.id,
      });
      return undefined;
    }

    // eslint-disable-next-line no-console
    console.log('[ScrollRecorder] adding scroll listener with threshold', config.scrollThreshold);

    const handleScroll = () => {
      const { scrollY, scrollX } = window;

      // Debounce scroll recording (wait 200ms after last scroll event)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        // eslint-disable-next-line no-console
        console.log('[ScrollRecorder] scroll event debounced', { scrollY, scrollX });
        recordScroll(scrollY, scrollX);
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [config.enabled, config.scrollThreshold, session?.user?.id, isReplaying]);

  return null;
}
