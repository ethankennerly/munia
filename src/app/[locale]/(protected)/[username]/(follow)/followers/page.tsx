import { DiscoverProfiles } from '@/components/DiscoverProfiles';
import { DiscoverSearch } from '@/components/DiscoverSearch';
import { DiscoverFilters } from '@/components/DiscoverFilters';
import { getTranslations } from 'next-intl/server';
import { getProfile } from '../../getProfile';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const t = await getTranslations();
  const { username } = await params;
  const profile = await getProfile(username);
  return {
    title: profile ? t('followers_or_profile_name', { name: profile.name }) : t('followers'),
  };
}

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const t = await getTranslations();
  const { username } = await params;
  const profile = await getProfile(username);

  return (
    <main>
      <div className="p-4">
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">
          {profile ? t('followers_name', { name: profile.name }) : t('followers')}
        </h1>
        <DiscoverSearch label={t('search_followers')} />
        <DiscoverFilters />
        <DiscoverProfiles followersOf={profile?.id} />
      </div>
    </main>
  );
}
