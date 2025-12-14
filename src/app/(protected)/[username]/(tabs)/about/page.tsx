import { getProfile } from '../../getProfile';
import { About } from './About';
import { getServerUser } from '@/lib/getServerUser';
import { DeleteAccountButton } from '@/components/DeleteAccountButton';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  return {
    title: `About | ${profile?.name}` || 'About',
  };
}

export default async function Page({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  if (!profile) return null;
  const [sessionUser] = await getServerUser();
  const isOwnProfile = sessionUser?.id === profile.id;

  return (
    <div className="mt-4">
      <About profile={profile} />
      {isOwnProfile && <DeleteAccountButton />}
    </div>
  );
}
