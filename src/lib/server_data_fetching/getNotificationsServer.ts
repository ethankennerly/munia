/**
 * Server-side notifications fetch – queries Prisma directly, bypassing HTTP.
 * Used by the notifications page to prefetch first-page data so React Query
 * can hydrate immediately, eliminating the client-side fetch that drives the
 * LCP element render delay.
 */
import { ACTIVITIES_PER_PAGE } from '@/constants';
import prisma from '@/lib/prisma/prisma';
import { toGetActivities } from '@/lib/prisma/toGetActivities';
import { GetActivity } from '@/types/definitions';

const selectUser = {
  select: {
    id: true,
    username: true,
    name: true,
    profilePhoto: true,
    gender: true,
  },
} as const;

export async function getNotificationsServer(userId: string): Promise<GetActivity[]> {
  const activities = await prisma.activity.findMany({
    where: {
      targetUserId: userId,
      sourceUserId: { not: userId },
    },
    take: ACTIVITIES_PER_PAGE,
    orderBy: { id: 'desc' },
    select: {
      id: true,
      type: true,
      sourceId: true,
      targetId: true,
      createdAt: true,
      isNotificationRead: true,
      sourceUser: selectUser,
      targetUser: selectUser,
    },
  });

  return toGetActivities(activities);
}
