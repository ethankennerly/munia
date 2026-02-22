import { logger } from '@/lib/logging';
import { getPostHogClient } from '@/lib/posthog-server';

export type CreateUserParams = {
  user: unknown;
  account: unknown;
  profile: unknown;
};

/** Providers whose profile picture should be imported on first sign-up. */
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

export async function handleCreateUser({ user, account, profile }: CreateUserParams) {
  try {
    const provider =
      account && typeof account === 'object'
        ? ((account as { provider?: unknown }).provider as string | undefined)
        : undefined;
    const profileKeys = profile && typeof profile === 'object' ? Object.keys(profile as object) : [];
    logger.info({ msg: 'createUser_event', provider: String(provider ?? 'unknown'), profileKeys });

    // Track user sign-up event server-side
    const userId = user && typeof user === 'object' ? ((user as { id?: unknown }).id as string | undefined) : undefined;
    if (userId) {
      const posthog = getPostHogClient();
      posthog?.capture({
        distinctId: userId,
        event: 'user_signed_up',
        properties: {
          provider: provider ?? 'unknown',
        },
      });
      // Identify the user in PostHog
      posthog?.identify({
        distinctId: userId,
        properties: {
          signup_provider: provider ?? 'unknown',
          created_at: new Date().toISOString(),
        },
      });
    }

    if (!provider || !IMPORT_PROVIDERS.has(provider)) return;

    const picture = extractImageUrl(user, profile);
    if (!picture) {
      logger.info({ msg: 'createUser_no_picture', provider, profileKeys });
      return;
    }

    if (!userId) {
      logger.warn({ msg: 'createUser_no_userId' });
      return;
    }

    // Lazily import to avoid heavy deps at module load
    const { importProfilePic } = await import('@/lib/auth/importProfilePic');
    await importProfilePic({ pictureUrl: picture, userId, provider });
  } catch (err) {
    logger.warn({ msg: 'createUser_import_profile_failed', err: (err as Error)?.message ?? 'unknown' });
  }
}
