import { Posts } from '@/components/Posts';
import { FeedHeader } from '@/components/FeedHeader';
import { getServerUser } from '@/lib/getServerUser';

export const metadata = {
  title: 'Munia | Feed',
};

export default async function Page() {
  const [user] = await getServerUser();
  return (
    <main>
      <div className="px-4 pt-4">
        <FeedHeader />
        {user && <Posts type="feed" userId={user.id} />}
      </div>
    </main>
  );
}
