import { DiscoverProfiles } from '@/components/DiscoverProfiles';
import { DiscoverSearch } from '@/components/DiscoverSearch';
import { DiscoverFilters } from '@/components/DiscoverFilters';
import { getTranslations } from 'next-intl/server';
import { getProfile } from '../../getProfile';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const t = await getTranslations();
  const profile = await getProfile(params.username);
  return {
    title: profile ? t('following_or_profile_name', { name: profile.name }) : t('following'),
  };
}

export default async function Page({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  const t = await getTranslations();

  return (
    <main>
      <div className="p-4">
        <h1 className="mb-6 mt-1 text-4xl font-bold">
          {profile ? t('and_apos_s_following', { name: profile.name }) : t('following')}
        </h1>
        <DiscoverSearch label={t('search_following')} />
        <DiscoverFilters />
        <DiscoverProfiles followingOf={profile?.id} />
      </div>
    </main>
  );
}
