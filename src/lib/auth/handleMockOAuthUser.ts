import prisma from '@/lib/prisma/prisma';
import { logger } from '@/lib/logging';

/**
 * Handle Mock OAuth user creation and profile picture import.
 *
 * Credentials providers bypass the PrismaAdapter, so `events.createUser`
 * never fires for mock-oauth. This function handles the full flow:
 * 1. Find or create the user in the database.
 * 2. Import profile picture from i.pravatar.cc for new users
 *    or existing users without a profile photo.
 *
 * @returns Auth.js-compatible User object with deterministic `image`.
 */
export async function handleMockOAuthUser({ email, name }: { email: string; name: string }) {
  const mockId = `mock:${email}`;

  let dbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, profilePhoto: true },
  });

  const isNewUser = !dbUser;

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: mockId,
        email,
        name,
        emailVerified: new Date(),
      },
      select: { id: true, email: true, name: true, profilePhoto: true },
    });
  }

  const pictureUrl = `https://i.pravatar.cc/200?u=${encodeURIComponent(email)}`;

  // Import profile pic for new users or users whose previous import failed
  if (isNewUser || !dbUser.profilePhoto) {
    try {
      const { importProfilePic } = await import('@/lib/auth/importProfilePic');
      await importProfilePic({ pictureUrl, userId: dbUser.id, provider: 'mock-oauth' });
    } catch (err) {
      logger.warn({ msg: 'mock_oauth_profile_import_failed', err: (err as Error)?.message ?? 'unknown' });
    }
  }

  return {
    id: dbUser.id,
    name: dbUser.name || name,
    email: dbUser.email || email,
    image: pictureUrl,
  };
}
