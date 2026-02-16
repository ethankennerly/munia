import { importProfilePic } from './importProfilePic';

/**
 * Backward-compatible wrapper that delegates to the generic {@link importProfilePic}
 * with `provider: 'google'`.
 */
export async function importGoogleProfilePic({ pictureUrl, userId }: { pictureUrl: string; userId: string }) {
  return importProfilePic({ pictureUrl, userId, provider: 'google' });
}
