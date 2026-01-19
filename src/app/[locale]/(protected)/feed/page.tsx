import { Posts } from '@/components/Posts';
import { FeedHeader } from '@/components/FeedHeader';
import { GenericLoading } from '@/components/GenericLoading';
import { getServerUser } from '@/lib/getServerUser';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t('munia_or_feed'),
  };
}

export default async function Page() {
  const [user] = await getServerUser();
  const t = await getTranslations();
  return (
    <main>
      <div className="px-4 pt-4">
        <FeedHeader />
        {user && (
          <Suspense fallback={<GenericLoading>{t('components_loading_page')}</GenericLoading>}>
            <Posts type="feed" userId={user.id} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
