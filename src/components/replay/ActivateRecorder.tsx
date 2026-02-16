'use client';

import { useEffect } from 'react';
import { recordActivate } from '@/lib/replay/recordActivate';
import { getReplayConfig } from '@/lib/replay/config';
import { useSession } from 'next-auth/react';
import { useReplayContext } from '@/lib/replay/replayContext';
import * as Sentry from '@sentry/nextjs';

function logEventAndUserId(event: MouseEvent | KeyboardEvent, userId: string | undefined) {
  const activateId = recordActivate(event);
  if (activateId && userId) {
    logActivateToSentry(activateId, userId);
  }
}

function logActivateToSentry(activateId: string, userId: string) {
  const attributes: Record<string, string> = {
    activateId: activateId,
    userId: userId,
  };
  Sentry.logger.info('activate', attributes);
}

/**
 * Records activation events (click, tap, Enter, Space) for session replay.
 * Only records when replay is enabled and user is authenticated.
 * Does not record during active replay sessions.
 */
export function ActivateRecorder() {
  const { data: session } = useSession();
  const config = getReplayConfig();
  const { isReplaying } = useReplayContext();

  useEffect(() => {
    if (isReplaying) {
      return undefined;
    }

    if (!config.enabled || !session?.user?.id) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      logEventAndUserId(event, session?.user?.id);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      logEventAndUserId(event, session?.user?.id);
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [config.enabled, session?.user?.id, isReplaying]);

  return null;
}
