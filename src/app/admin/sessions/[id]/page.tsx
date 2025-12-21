'use client';

import { useEffect, useState } from 'react';

export default function Page({ params }: { params: { id: string } }) {
  const [actions, setActions] = useState<unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load actions
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/replay/sessions/${params.id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setActions(data.actions || []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load session';
        setError(msg);
      }
    })();
  }, [params.id]);

  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!actions) return <p className="p-4">Loading...</p>;

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Session {params.id}</h1>
      <p className="mb-4">Replay functionality will be implemented per Day 1 MVP spec.</p>
      <div className="mt-4">
        <p>Actions recorded: {actions.length}</p>
        <pre className="mt-2 max-h-96 overflow-auto rounded border border-gray-300 bg-gray-50 p-4 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
          {JSON.stringify(actions, null, 2)}
        </pre>
      </div>
    </main>
  );
}
