'use client';

import { useEffect } from 'react';
import { recordActivate } from '@/lib/replay/recordActivate';
import { getReplayConfig } from '@/lib/replay/config';
import { useSession } from 'next-auth/react';
import { useReplayContext } from '@/lib/replay/replayContext';
import posthog from 'posthog-js';
import { snakeCase } from 'lodash';

function logEventAndUserId(event: MouseEvent | KeyboardEvent) {
  const activateId = recordActivate(event);
  logActivateToPosthog(activateId);
}

function logActivateToPosthog(activateId: string | null) {
  if (!activateId || !process.env.NEXT_PUBLIC_POSTHOG_KEY || !posthog) {
    return;
  }

  const snakeCaseId = snakeCase(activateId);
  posthog.capture(snakeCaseId + '_activated');
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
      logEventAndUserId(event);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      logEventAndUserId(event);
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
