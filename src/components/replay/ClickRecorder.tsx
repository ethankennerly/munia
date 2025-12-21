'use client';

import { useEffect } from 'react';
import { recordClick } from '@/lib/replay/recordClick';
import { getReplayConfig } from '@/lib/replay/config';
import { useSession } from 'next-auth/react';
import { useReplayContext } from '@/lib/replay/replayContext';

/**
 * Records click events for session replay.
 * Only records when replay is enabled and user is authenticated.
 * Does not record during active replay sessions.
 */
export function ClickRecorder() {
  const { data: session } = useSession();
  const config = getReplayConfig();
  const { isReplaying } = useReplayContext();

  useEffect(() => {
    // Don't record during replay
    if (isReplaying) {
      return undefined;
    }

    // Only record if enabled and user is authenticated
    if (!config.enabled || !session?.user?.id) {
      return undefined;
    }

    // Add click event listener
    const handleClick = (event: MouseEvent) => {
      recordClick(event);
    };

    // Add keyboard event listener for Enter/Space on buttons/links
    const handleKeyDown = (event: KeyboardEvent) => {
      recordClick(event);
    };

    document.addEventListener('click', handleClick, true); // Use capture phase
    document.addEventListener('keydown', handleKeyDown, true); // Use capture phase

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [config.enabled, session?.user?.id, isReplaying]);

  return null;
}
