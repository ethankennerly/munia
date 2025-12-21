'use client';

import { useEffect } from 'react';
import { recordClick } from '@/lib/replay/recordClick';
import { getReplayConfig } from '@/lib/replay/config';
import { useSession } from 'next-auth/react';

/**
 * Records click events for session replay.
 * Only records when replay is enabled and user is authenticated.
 */
export function ClickRecorder() {
  const { data: session } = useSession();
  const config = getReplayConfig();

  useEffect(() => {
    // Only record if enabled and user is authenticated
    if (!config.enabled || !session?.user?.id) {
      return undefined;
    }

    // Add click event listener
    const handleClick = (event: MouseEvent) => {
      recordClick(event);
    };

    document.addEventListener('click', handleClick, true); // Use capture phase

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [config.enabled, session?.user?.id]);

  return null;
}
