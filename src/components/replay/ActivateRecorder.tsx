'use client';

import { useEffect } from 'react';
import { recordActivate } from '@/lib/replay/recordActivate';
import posthog from 'posthog-js';
import { snakeCase } from 'lodash';

function isPosthogEnabled() {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY && posthog;
}

function logEventAndUserId(event: MouseEvent | KeyboardEvent) {
  const activateId = recordActivate(event);
  logActivateToPosthog(activateId);
}

function logActivateToPosthog(activateId: string | null) {
  if (!activateId || !isPosthogEnabled()) {
    return;
  }

  const snakeCaseId = snakeCase(activateId);
  posthog.capture(snakeCaseId + '_activated');
}

/**
 * Records activation events (click, tap, Enter, Space) to Posthog.
 */
export function ActivateRecorder() {
  useEffect(() => {
    if (!isPosthogEnabled()) {
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
  });

  return null;
}
