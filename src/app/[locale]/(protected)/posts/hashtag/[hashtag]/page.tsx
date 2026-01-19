import { Posts } from '@/components/Posts';
import { GenericLoading } from '@/components/GenericLoading';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export default async function Page({ params }: { params: Promise<{ hashtag: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations();
  return (
    <main>
      <div className="px-4 pt-4">
        <h1 className="mb-4 text-4xl font-bold">#{resolvedParams.hashtag}</h1>
        <Suspense fallback={<GenericLoading>{t('components_loading_page')}</GenericLoading>}>
          <Posts type="hashtag" hashtag={resolvedParams.hashtag} />
        </Suspense>
      </div>
    </main>
  );
}
