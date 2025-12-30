import { getServerUser } from '@/lib/getServerUser';
import { getProfile } from '../../getProfile';
import { Activities } from './Activities';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  return {
    title: `Activity | ${profile?.name}` || 'Activity',
  };
}

export default async function Page({ params }: { params: { username: string } }) {
  const [user] = await getServerUser();
  if (!user)
    return (
      <main>
        <p>This is a protected page.</p>
      </main>
    );
  const profile = await getProfile(params.username);
  const isOwn = user?.id === profile?.id;

  if (!isOwn)
    return (
      <main>
        <p>You have no access to this page.</p>
      </main>
    );
  return (
    <main>
      <div className="mt-4">
        <Activities userId={user.id} />
      </div>
    </main>
  );
}
