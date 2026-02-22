'use client';

import { useEffect } from 'react';
import { recordActivate } from '@/lib/replay/recordActivate';
import posthog from 'posthog-js';
import { snakeCase } from 'lodash';
import { useSession } from 'next-auth/react';

function isPosthogEnabled() {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY && posthog;
}

function logEventAndUserId(event: MouseEvent | KeyboardEvent, userId: string | undefined) {
  const activateId = recordActivate(event);
  logActivateToPosthog(activateId, userId);
}

function logActivateToPosthog(activateId: string | null, userId: string | undefined) {
  if (!activateId || !isPosthogEnabled()) {
    return;
  }

  const eventProperties: Record<string, string> = {};
  if (userId) {
    eventProperties.distinct_id = userId;
  }
  const snakeCaseId = snakeCase(activateId);
  posthog.capture(snakeCaseId + '_activated', eventProperties);
}

/**
 * Records activation events (click, tap, Enter, Space) to Posthog.
 */
export function ActivateRecorder() {
  const userId = useSession()?.data?.user?.id;
  useEffect(() => {
    if (!isPosthogEnabled()) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      logEventAndUserId(event, userId);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      logEventAndUserId(event, userId);
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [userId]);

  return null;
}
