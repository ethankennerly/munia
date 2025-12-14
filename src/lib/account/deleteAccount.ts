import prisma from '@/lib/prisma/prisma';
import { deleteObject } from '@/lib/s3/deleteObject';
import { logger } from '@/lib/logging';

type DeleteAccountResult = {
  deletedUserId: string | null;
  deletedFileNames: string[];
};

/**
 * Hard-deletes the user and all related entities (via Prisma cascade),
 * and removes associated media files from S3 (profile, cover, visual media).
 * Idempotent: if user is not found, returns success with no-op.
 */
export async function deleteAccount(userId: string): Promise<DeleteAccountResult> {
  logger.info({ msg: 'delete_account_fn_enter', userId });
  // Collect S3 object keys before deleting the user (since cascades will remove rows)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePhoto: true, coverPhoto: true },
  });

  if (!user) {
    logger.info({ msg: 'delete_account_user_not_found', userId });
    return { deletedUserId: null, deletedFileNames: [] };
  }

  const visualMedia = await prisma.visualMedia.findMany({
    where: { userId },
    select: { fileName: true },
  });

  const fileNames = [
    ...visualMedia.map((m) => m.fileName),
    ...(user.profilePhoto ? [user.profilePhoto] : []),
    ...(user.coverPhoto ? [user.coverPhoto] : []),
  ];

  logger.debug({
    msg: 's3_cleanup_start',
    counts: { profile: Number(!!user.profilePhoto), cover: Number(!!user.coverPhoto), media: visualMedia.length },
  });
  // Best-effort S3 cleanup; continue even if some deletions fail
  await Promise.all(
    fileNames.map(async (key) => {
      try {
        await deleteObject(key);
      } catch (err) {
        logger.error({ msg: 's3_delete_failed', key, err: (err as Error).message });
      }
    }),
  );
  logger.debug({ msg: 's3_cleanup_result', ok: true, deletions: fileNames.length });

  // Delete user (cascades remove related rows)
  logger.debug({ msg: 'db_delete_start', userId });
  await prisma.user.delete({ where: { id: userId } });
  logger.info({ msg: 'db_delete_result', ok: true, userId });

  return { deletedUserId: userId, deletedFileNames: fileNames };
}
