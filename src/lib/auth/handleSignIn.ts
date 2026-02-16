import { logger } from '@/lib/logging';
import prisma from '@/lib/prisma/prisma';

export type SignInParams = {
  user: unknown;
  account: unknown;
  profile: unknown;
};

/** Providers whose profile picture should be imported on sign-in (one-time retry). */
const IMPORT_PROVIDERS = new Set(['google', 'github', 'facebook', 'mock-oauth']);

/**
 * Extract the profile picture URL from Auth.js-normalized `user.image`
 * with fallback to provider-specific `profile` fields.
 */
function extractImageUrl(user: unknown, profile: unknown): string | undefined {
  // Auth.js normalizes all providers into user.image
  if (user && typeof user === 'object') {
    const image = (user as { image?: unknown }).image;
    if (typeof image === 'string' && image) return image;
  }

  // Fallback: Google-specific profile.picture
  if (profile && typeof profile === 'object') {
    const picture = (profile as { picture?: unknown }).picture;
    if (typeof picture === 'string' && picture) return picture;

    // Fallback: Facebook nested picture.data.url structure (for large profile pictures)
    if (picture && typeof picture === 'object') {
      const data = (picture as { data?: unknown }).data;
      if (data && typeof data === 'object') {
        const url = (data as { url?: unknown }).url;
        if (typeof url === 'string' && url) return url;
      }
    }

    // Fallback: GitHub-specific profile.avatar_url
    const avatarUrl = (profile as { avatar_url?: unknown }).avatar_url;
    if (typeof avatarUrl === 'string' && avatarUrl) return avatarUrl;
  }

  return undefined;
}

export async function handleSignIn({ user, account, profile }: SignInParams) {
  try {
    const provider =
      account && typeof account === 'object'
        ? ((account as { provider?: unknown }).provider as string | undefined)
        : undefined;
    logger.info({ msg: 'signIn_event', provider: String(provider ?? 'unknown') });

    if (!provider || !IMPORT_PROVIDERS.has(provider)) return;

    const userId = user && typeof user === 'object' ? ((user as { id?: unknown }).id as string | undefined) : undefined;
    if (!userId) return;

    // Check current DB state to avoid overwriting an existing profilePhoto
    const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { profilePhoto: true } });
    if (!dbUser) return;

    if (dbUser.profilePhoto) {
      logger.info({ msg: 'signIn_has_profile_photo', userId });
      return;
    }

    const picture = extractImageUrl(user, profile);
    if (!picture) {
      logger.info({ msg: 'signIn_no_picture', userId });
      return;
    }

    const { importProfilePic } = await import('@/lib/auth/importProfilePic');
    await importProfilePic({ pictureUrl: picture, userId, provider });
    logger.info({ msg: 'signIn_import_attempted', userId, provider });
  } catch (err) {
    logger.warn({ msg: 'signIn_import_failed', err: (err as Error)?.message ?? 'unknown' });
  }
}
