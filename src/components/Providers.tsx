'use client';

import { CreatePostModalContextProvider } from '@/contexts/CreatePostModalContext';
import { DialogsContextProvider } from '@/contexts/DialogsContext';
import { ReactQueryProvider } from '@/contexts/ReactQueryProvider';
import { ShouldAnimateContextProvider } from '@/contexts/ShouldAnimateContext';
import { ThemeContextProvider } from '@/contexts/ThemeContext';
import { ToastContextProvider } from '@/contexts/ToastContext';
import { VisualMediaModalContextProvider } from '@/contexts/VisualMediaModalContext';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import React, { useEffect } from 'react';
import { RouteRecorder } from '@/components/replay/RouteRecorder';
import { ActivateRecorder } from '@/components/replay/ActivateRecorder';
import { ScrollRecorder } from '@/components/replay/ScrollRecorder';
import { ReplayProvider } from '@/lib/replay/replayContext';
import { setupDeploymentSync } from '@/lib/utils/deploymentSync';

export function Providers({ children, session }: { children: React.ReactNode; session: Session | null }) {
  useEffect(() => setupDeploymentSync(window), []);

  return (
    <ThemeContextProvider>
      <ToastContextProvider>
        <ReactQueryProvider>
          <SessionProvider session={session}>
            <ReplayProvider>
              <RouteRecorder />
              <ActivateRecorder />
              <ScrollRecorder />
              <DialogsContextProvider>
                <VisualMediaModalContextProvider>
                  <CreatePostModalContextProvider>
                    <ShouldAnimateContextProvider>{children}</ShouldAnimateContextProvider>
                  </CreatePostModalContextProvider>
                </VisualMediaModalContextProvider>
              </DialogsContextProvider>
            </ReplayProvider>
          </SessionProvider>
        </ReactQueryProvider>
      </ToastContextProvider>
    </ThemeContextProvider>
  );
}
