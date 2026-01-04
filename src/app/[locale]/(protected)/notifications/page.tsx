import { getServerUser } from '@/lib/getServerUser';
import { getTranslations } from 'next-intl/server';
import { Notifications } from './Notifications';

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t('munia_or_notifications'),
  };
}

export default async function Page() {
  const [user] = await getServerUser();

  if (!user) return null;
  return (
    <main>
      <div className="px-4 pt-4">
        <Notifications userId={user.id} />
      </div>
    </main>
  );
}
