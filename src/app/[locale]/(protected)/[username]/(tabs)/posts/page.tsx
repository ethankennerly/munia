import { Posts } from '@/components/Posts';
import { CreatePostModalLauncher } from '@/components/CreatePostModalLauncher';
import { getServerUser } from '@/lib/getServerUser';
import { getTranslations } from 'next-intl/server';
import { getProfile } from '../../getProfile';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const t = await getTranslations();
  const { username } = await params;
  const profile = await getProfile(username);
  return {
    title: profile?.name || t('munia'),
  };
}

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const [user] = await getServerUser();
  const { username } = await params;
  const profile = await getProfile(username);
  const shouldShowCreatePost = user?.id === profile?.id;

  return (
    <main>
      <div>
        {shouldShowCreatePost && (
          <div className="mt-4">
            <CreatePostModalLauncher />
          </div>
        )}
        {profile && <Posts type="profile" userId={profile.id} />}
      </div>
    </main>
  );
}
