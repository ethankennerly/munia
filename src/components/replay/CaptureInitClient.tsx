'use client';

/* eslint-disable consistent-return */

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { getReplayConfig } from '@/lib/replay/config';
import { v4 as uuidv4 } from 'uuid';

// Lazy import rrweb on client only
type RRWebRecord = typeof import('rrweb')['record'];

export function CaptureInitClient() {
  const { data } = useSession();
  const startedRef = useRef(false);
  const sessionIdRef = useRef<string>('');
  const chunkIndexRef = useRef(0);
  const bufferRef = useRef<unknown[]>([]);
  const stopRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const cfg = getReplayConfig();
    const isAuthed = !!data?.user?.id;
    if (!cfg.enabled || !isAuthed || startedRef.current) return;
    startedRef.current = true;
    sessionIdRef.current = uuidv4();

    let flushTimer: number | undefined;
    const flush = async () => {
      if (bufferRef.current.length === 0) return;
      const events = bufferRef.current.splice(0, bufferRef.current.length);
      try {
        await fetch('/api/replay/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            chunkIndex: (chunkIndexRef.current += 1) - 1,
            events,
            startedAt: Date.now(),
            endedAt: Date.now(),
            meta: { ua: navigator.userAgent, viewport: { w: window.innerWidth, h: window.innerHeight } },
          }),
          cache: 'no-store',
        });
      } catch {
        // ignore in MVP
      }
    };

    const start = async () => {
      const { record } = (await import('rrweb')) as unknown as { record: RRWebRecord };
      const unlisten = record({
        emit(event) {
          bufferRef.current.push(event);
        },
        maskAllInputs: true,
        blockClass: 'rr-block',
        maskTextClass: 'rr-mask',
        ignoreClass: 'rr-ignore',
        plugins: [],
      });
      // rrweb types may return `undefined` if record failed; normalize to a no-op
      stopRef.current = typeof unlisten === 'function' ? unlisten : () => {};
      flushTimer = window.setInterval(flush, 3000);
    };
    start();

    const onUnload = () => {
      stopRef.current?.();
      stopRef.current = null;
      // Best-effort flush; don't await in unload
      flush();
      if (flushTimer) window.clearInterval(flushTimer);
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      window.removeEventListener('beforeunload', onUnload);
      stopRef.current?.();
      stopRef.current = null;
      if (flushTimer) window.clearInterval(flushTimer);
      // Best-effort flush on unmount
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user?.id]);

  return null;
}
