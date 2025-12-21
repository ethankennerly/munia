'use client';

import { useEffect, useState } from 'react';
import { decodeAction, type Action } from './encoding';

export function useReplayActions(sessionId: string) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchActions() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/replay/sessions/${sessionId}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const decodedActions = (data.actions || []).map(
          (encoded: { t: string; ts: number; d: Record<string, unknown> }) => decodeAction(encoded),
        );

        if (!cancelled) {
          setActions(decodedActions);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load actions');
          setLoading(false);
        }
      }
    }

    fetchActions();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return { actions, loading, error };
}
