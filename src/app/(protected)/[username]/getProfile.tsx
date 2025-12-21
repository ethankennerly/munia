import prisma from '@/lib/prisma/prisma';
import { GetUser, FindUserResult } from '@/types/definitions';
import { includeToUser } from '@/lib/prisma/includeToUser';
import { toGetUser } from '@/lib/prisma/toGetUser';
import { getServerUser } from '@/lib/getServerUser';
import { logger } from '@/lib/logging';

export async function getProfile(username: string) {
  // Get the authenticated user for follow status check
  const [user] = await getServerUser();

  // Query user directly from Prisma instead of making HTTP request
  // This avoids caching issues and ensures fresh data
  const findUserResult: FindUserResult | null = await prisma.user.findFirst({
    where: {
      username,
    },
    include: includeToUser(user?.id),
  });

  if (!findUserResult) return null;

  logger.info({
    msg: 'profile_fetch_db',
    username,
    dbBirthDate: findUserResult.birthDate?.toISOString() || null,
  });

  // Convert to GetUser type (same as API endpoint)
  const profile: GetUser = toGetUser(findUserResult);

  logger.info({
    msg: 'profile_fetch_result',
    username,
    profileBirthDate: profile.birthDate?.toISOString() || null,
    profileBirthDateType: typeof profile.birthDate,
  });

  return profile;
}
