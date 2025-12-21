'use client';

import { useReplayActions } from '@/lib/replay/useReplayActions';
import { ReplayPlayer } from '@/components/replay/ReplayPlayer';

export default function Page({ params }: { params: { id: string } }) {
  const { actions, loading, error } = useReplayActions(params.id);

  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Session {params.id.substring(0, 8)}...</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        {actions.length} action{actions.length !== 1 ? 's' : ''} recorded
      </p>

      {actions.length > 0 ? (
        <>
          <ReplayPlayer actions={actions} />
          <div className="mt-4">
            <h2 className="mb-2 text-lg font-semibold">Actions Log</h2>
            <pre className="max-h-96 overflow-auto rounded border border-gray-300 bg-gray-50 p-4 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
              {JSON.stringify(
                actions.map((a) => ({
                  type: a.type,
                  timestamp: a.timestamp,
                  data: a.data,
                })),
                null,
                2,
              )}
            </pre>
          </div>
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No actions recorded for this session.</p>
      )}
    </main>
  );
}
