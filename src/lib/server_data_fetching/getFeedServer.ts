/**
 * Server-side feed fetch – queries Prisma directly, bypassing HTTP.
 * Used by the feed page to prefetch first-page data so React Query
 * can hydrate immediately, eliminating the client-side fetch that drives the
 * LCP element render delay.
 */
import { POSTS_PER_PAGE } from '@/constants';
import prisma from '@/lib/prisma/prisma';
import { selectPost } from '@/lib/prisma/selectPost';
import { toGetPost } from '@/lib/prisma/toGetPost';
import { GetPost } from '@/types/definitions';

export async function getFeedServer(userId: string): Promise<GetPost[]> {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = following.map((u) => u.followingId);

  const posts = await prisma.post.findMany({
    where: {
      userId: { in: [...followingIds, userId] },
    },
    take: POSTS_PER_PAGE,
    orderBy: { id: 'desc' },
    select: selectPost(userId),
  });

  return Promise.all(posts.map(toGetPost));
}
