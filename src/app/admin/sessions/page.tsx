import { requireAdmin } from '@/lib/replay/admin';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const admin = await requireAdmin();
  if (!admin) return <p>Forbidden</p>;
  // On the server, fetch requires an absolute URL. Derive base from env.
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3002';
  const url = base.startsWith('http') ? `${base}/api/replay/sessions` : `https://${base}/api/replay/sessions`;
  const res = await fetch(url, {
    cache: 'no-store',
  });
  const data = (await res.json()) as { sessions?: { id: string; bytes: number; startedAt: number; endedAt: number }[] };
  const sessions = data.sessions || [];
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
              <th className="p-2">Size</th>
              <th className="p-2">Started</th>
              <th className="p-2">Ended</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">
                  <a className="text-primary underline" href={`/admin/sessions/${s.id}`}>
                    {s.id}
                  </a>
                </td>
                <td className="p-2">{(s.bytes / 1024).toFixed(1)} KB</td>
                <td className="p-2">{new Date(s.startedAt).toLocaleString()}</td>
                <td className="p-2">{new Date(s.endedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
