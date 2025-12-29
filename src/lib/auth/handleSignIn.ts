import { logger } from '@/lib/logging';
import prisma from '@/lib/prisma/prisma';

export type SignInParams = {
  user: unknown;
  account: unknown;
  profile: unknown;
};

export async function handleSignIn({ user, account, profile }: SignInParams) {
  try {
    const provider =
      account && typeof account === 'object'
        ? ((account as { provider?: unknown }).provider as string | undefined)
        : undefined;
    logger.info({ msg: 'signIn_event', provider: String(provider ?? 'unknown') });

    if (provider !== 'google') return;

    const userId = user && typeof user === 'object' ? ((user as { id?: unknown }).id as string | undefined) : undefined;
    if (!userId) return;

    // Check current DB state to avoid overwriting an existing profilePhoto
    const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { profilePhoto: true } });
    if (!dbUser) return;

    if (dbUser.profilePhoto) {
      logger.info({ msg: 'signIn_has_profile_photo', userId });
      return;
    }

    const picture =
      profile && typeof profile === 'object'
        ? ((profile as { picture?: unknown }).picture as string | undefined)
        : undefined;
    if (!picture) {
      logger.info({ msg: 'signIn_no_picture', userId });
      return;
    }

    const { importGoogleProfilePic } = await import('@/lib/auth/importGoogleProfilePic');
    await importGoogleProfilePic({ pictureUrl: picture, userId });
    logger.info({ msg: 'signIn_import_attempted', userId });
  } catch (err) {
    logger.warn({ msg: 'signIn_import_failed', err: (err as Error)?.message ?? 'unknown' });
  }
}
