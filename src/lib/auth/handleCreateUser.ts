import { logger } from '@/lib/logging';

export type CreateUserParams = {
  user: unknown;
  account: unknown;
  profile: unknown;
};

export async function handleCreateUser({ user, account, profile }: CreateUserParams) {
  try {
    const provider =
      account && typeof account === 'object'
        ? ((account as { provider?: unknown }).provider as string | undefined)
        : undefined;
    const profileKeys = profile && typeof profile === 'object' ? Object.keys(profile as object) : [];
    logger.info({ msg: 'createUser_event', provider: String(provider ?? 'unknown'), profileKeys });

    if (provider !== 'google') return;

    const picture =
      profile && typeof profile === 'object'
        ? ((profile as { picture?: unknown }).picture as string | undefined)
        : undefined;
    if (!picture) {
      logger.info({ msg: 'createUser_no_picture', provider: String(provider ?? 'google'), profileKeys });
      return;
    }

    // Lazily import to avoid heavy deps at module load
    const { importGoogleProfilePic } = await import('@/lib/auth/importGoogleProfilePic');
    const userId = user && typeof user === 'object' ? ((user as { id?: unknown }).id as string | undefined) : undefined;
    if (!userId) {
      logger.warn({ msg: 'createUser_no_userId' });
      return;
    }

    await importGoogleProfilePic({ pictureUrl: picture, userId });
  } catch (err) {
    logger.warn({ msg: 'createUser_import_google_failed', err: (err as Error)?.message ?? 'unknown' });
  }
}
