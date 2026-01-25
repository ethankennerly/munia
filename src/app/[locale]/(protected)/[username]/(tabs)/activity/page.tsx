import { getServerUser } from '@/lib/getServerUser';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { getProfile } from '../../getProfile';
import { Activities } from './Activities';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const t = await getTranslations();
  const profile = await getProfile(username);

  return {
    title: profile ? t('activity_or_profile_name', { name: profile.name }) : t('activity'),
  };
}

export default async function Page({ params }: { params: Promise<{ username: string; locale: string }> }) {
  const { locale, username } = await params;
  const t = await getTranslations({ locale });
  const [user] = await getServerUser();
  if (!user)
    return (
      <main>
        <p>{t('this_is_a_protected_page')}</p>
      </main>
    );
  const profile = await getProfile(username);
  const isOwn = user?.id === profile?.id;

  if (!isOwn)
    return (
      <main>
        <p>{t('you_have_no_access_to_this_page')}</p>
      </main>
    );
  return (
    <main>
      <div className="mt-4">
        <Suspense fallback={<div className="mt-6 text-center text-lg">{t('loading_activities')}</div>}>
          <Activities userId={user.id} />
        </Suspense>
      </div>
    </main>
  );
}
