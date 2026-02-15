import { Posts } from '@/components/Posts';
import { FeedHeader } from '@/components/FeedHeader';
import { getServerUser } from '@/lib/getServerUser';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t('munia_or_feed'),
  };
}

export default async function Page() {
  const [user] = await getServerUser();
  return (
    <main>
      <div className="px-4 pt-4">
        <FeedHeader />
        {user && <Posts type="feed" userId={user.id} />}
      </div>
    </main>
  );
}
