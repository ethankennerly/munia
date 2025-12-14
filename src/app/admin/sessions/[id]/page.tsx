'use client';

import { useEffect, useRef, useState } from 'react';

export default function Page({ params }: { params: { id: string } }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [events, setEvents] = useState<unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load events
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/replay/sessions/${params.id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setEvents(data.events || []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load session';
        setError(msg);
      }
    })();
  }, [params.id]);

  // Initialize rrweb Replayer when events load
  useEffect(() => {
    (async () => {
      if (!events || !containerRef.current) return;
      const mod = (await import('rrweb')) as unknown as {
        Replayer: new (
          evts: unknown[],
          options: { speed: number },
        ) => {
          play: (container?: HTMLElement) => void;
        };
      };
      const { Replayer } = mod;
      const replayer = new Replayer(events, { speed: 1 });
      containerRef.current.innerHTML = '';
      replayer.play(containerRef.current);
    })();
  }, [events]);

  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!events) return <p className="p-4">Loading...</p>;

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Session {params.id}</h1>
      <div ref={containerRef} className="h-[70vh] w-full border" />
    </main>
  );
}
