'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordRoute } from '@/lib/replay/recordRoute';
import { initActionBuffer } from '@/lib/replay/actionBuffer';
import { getReplayConfig } from '@/lib/replay/config';
import { useSession } from 'next-auth/react';
import { useReplayContext } from '@/lib/replay/replayContext';

/**
 * Records route changes for session replay.
 * Only records when replay is enabled and user is authenticated.
 * Does not record during active replay sessions.
 */
export function RouteRecorder() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const config = getReplayConfig();
  const { isReplaying } = useReplayContext();

  useEffect(() => {
    // Don't record during replay
    if (isReplaying) return;

    // Only record if enabled and user is authenticated
    if (!config.enabled || !session?.user?.id) return;

    // Initialize action buffer on mount
    initActionBuffer();

    // Record route change
    recordRoute(pathname);
  }, [pathname, config.enabled, session?.user?.id, isReplaying]);

  return null;
}
