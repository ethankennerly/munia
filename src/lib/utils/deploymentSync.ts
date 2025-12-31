'use client';

import { logger } from '@/lib/logging-client';

export const setupDeploymentSync = (window: Window) => {
  if (typeof window === 'undefined') return undefined;

  function handleServerRedeployed(event: ErrorEvent) {
    if (event.message?.includes("reading 'call'") || event.message?.includes('Loading chunk')) {
      logger.warn({ message: 'Client is out of sync with server deployment, forcing reload...' });
      window.location.reload();
    }
  }

  window.addEventListener('error', handleServerRedeployed);

  return () => {
    window.removeEventListener('error', handleServerRedeployed);
  };
};
