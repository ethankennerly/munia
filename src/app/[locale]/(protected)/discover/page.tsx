import { DiscoverFilters } from '@/components/DiscoverFilters';
import { DiscoverProfiles } from '@/components/DiscoverProfiles';
import { DiscoverSearch } from '@/components/DiscoverSearch';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t('munia_or_discover'),
  };
}

export default async function Discover({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return (
    <main>
      <div className="px-4 pt-4">
        <h1 className="mb-4 text-4xl font-bold">{t('discover')}</h1>
        <DiscoverSearch />
        <DiscoverFilters />
        <DiscoverProfiles />
      </div>
    </main>
  );
}
