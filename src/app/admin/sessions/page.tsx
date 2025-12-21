import { requireAdmin } from '@/lib/replay/admin';
import { getSessions } from '@/lib/replay/getSessions';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const admin = await requireAdmin();
  if (!admin) return <p>Forbidden</p>;
  // Directly call the function instead of making an HTTP request
  const sessions = await getSessions();
  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Sessions</h1>
      {sessions.length === 0 ? (
        <p>No sessions yet.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Actions</th>
              <th className="p-2">Started</th>
              <th className="p-2">Ended</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">
                  <a className="text-primary underline" href={`/admin/sessions/${s.id}`}>
                    {s.id.substring(0, 8)}...
                  </a>
                </td>
                <td className="p-2">{s.actionCount}</td>
                <td className="p-2">{new Date(s.startedAt).toLocaleString()}</td>
                <td className="p-2">{s.endedAt ? new Date(s.endedAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
