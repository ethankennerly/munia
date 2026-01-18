import { getServerUser } from '@/lib/getServerUser';
import { DeleteAccountButton } from '@/components/DeleteAccountButton';
import { getTranslations } from 'next-intl/server';
import { getProfile } from '../../getProfile';
import { About } from './About';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const t = await getTranslations();
  const { username } = await params;
  const profile = await getProfile(username);
  return {
    title: profile ? t('about_or_profile_name', { name: profile.name }) : t('about'),
  };
}

export default async function Page({ params }: { params: { username: string } }) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) return null;

  return (
    <main>
      <div className="mt-4">
        <About profile={profile} />
      </div>
    </main>
  );
}
