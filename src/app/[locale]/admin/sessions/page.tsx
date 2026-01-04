import { requireAdmin } from '@/lib/replay/admin';
import { getSessions } from '@/lib/replay/getSessions';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const t = await getTranslations();
  const admin = await requireAdmin();
  if (!admin) return <p>{t('forbidden')}</p>;
  // Directly call the function instead of making an HTTP request
  const sessions = await getSessions();
  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">{t('sessions')}</h1>
      {sessions.length === 0 ? (
        <p>{t('no_sessions_yet')}</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">{t('actions')}</th>
              <th className="p-2">{t('started')}</th>
              <th className="p-2">{t('ended')}</th>
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
                <td className="p-2">{s.endedAt ? new Date(s.endedAt).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
