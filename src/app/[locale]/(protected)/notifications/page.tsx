import { getServerUser } from '@/lib/getServerUser';
import { getNotificationsServer } from '@/lib/server_data_fetching/getNotificationsServer';
import { getTranslations } from 'next-intl/server';
import { Notifications } from './Notifications';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t('munia_or_notifications'),
  };
}

export default async function Page() {
  const [user] = await getServerUser();

  if (!user) return null;

  // Prefetch first page server-side so the LCP element (first avatar) is
  // present on the initial render – eliminates the client-side fetch that
  // was causing the 570 ms element render delay.
  const initialNotifications = await getNotificationsServer(user.id);

  return (
    <main>
      <div className="px-4 pt-4">
        <Notifications userId={user.id} initialNotifications={initialNotifications} />
      </div>
    </main>
  );
}
