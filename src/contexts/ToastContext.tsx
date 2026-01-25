'use client';

import { ToastRegion } from '@/components/ui/ToastRegion';
import { ToastType } from '@/lib/toast';
import { ToastState, useToastState } from '@react-stately/toast';
import React, { createContext, useEffect, useMemo, useRef } from 'react';

export const ToastContext = createContext<{
  addToast: ToastState<ToastType>['add'] | null;
}>({
  addToast: null,
});

const TOAST_TIMEOUT_MS = 6000;

export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const state = useToastState<ToastType>({
    maxVisibleToasts: 5,
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const toastAddedAtRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        stateRef.current.pauseAll();
      } else {
        stateRef.current.resumeAll();
        const now = Date.now();
        stateRef.current.visibleToasts.forEach((t) => {
          const added = toastAddedAtRef.current.get(t.key);
          if (added != null && now - added >= TOAST_TIMEOUT_MS) {
            toastAddedAtRef.current.delete(t.key);
            stateRef.current.close(t.key);
          }
        });
      }
    };
    document.addEventListener('visibilitychange', handler);
    const poll = setInterval(() => {
      const now = Date.now();
      const toasts = stateRef.current.visibleToasts;
      if (toasts.length === 0) return;
      toasts.forEach((t) => {
        const added = toastAddedAtRef.current.get(t.key);
        if (added != null && now - added >= TOAST_TIMEOUT_MS) {
          toastAddedAtRef.current.delete(t.key);
          stateRef.current.close(t.key);
        }
      });
    }, 1000);
    return () => {
      document.removeEventListener('visibilitychange', handler);
      clearInterval(poll);
    };
  }, []);

  const memoizedValue = useMemo(
    () => ({
      addToast: ((content: ToastType, options?: { timeout?: number }) => {
        const key = stateRef.current.add(content, options);
        toastAddedAtRef.current.set(key, Date.now());
        return key;
      }) as ToastState<ToastType>['add'],
    }),
    [],
  );

  return (
    <ToastContext.Provider value={memoizedValue}>
      {state.visibleToasts.length > 0 && <ToastRegion state={state} />}
      {children}
    </ToastContext.Provider>
  );
}
