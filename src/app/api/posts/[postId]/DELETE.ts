/**
 * DELETE /api/posts/:postId
 * - Allows an authenticated post owner to delete a post.
 * - Requires recent authentication (≤ 5 minutes) and explicit confirmation.
 * - Hard deletes the post in the DB and removes associated media from S3.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import { deleteObject } from '@/lib/s3/deleteObject';
import { verifyAccessToPost } from './verifyAccessToPost';

// 5 minutes in ms
const RECENT_MS = 5 * 60 * 1000;

export async function DELETE(request: Request, { params }: { params: { postId: string } }) {
  // Entry log
  try {
    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'api_post_delete_enter',
        url: (request as any)?.url,
        method: 'DELETE',
        at: new Date().toISOString(),
      }),
    );
  } catch {}

  const postId = parseInt(params.postId, 10);
  try {
    console.log(
      JSON.stringify({
        level: 'debug',
        msg: 'api_post_delete_params',
        postId,
        isNaN: Number.isNaN(postId),
        contentType: request.headers.get('content-type'),
      }),
    );
  } catch {}

  // Validate request body for confirmation and recent-auth timestamp
  let confirm: unknown;
  let recentAuthTimestamp: unknown;
  try {
    const body = await request.json();
    confirm = (body as any)?.confirm;
    recentAuthTimestamp = (body as any)?.recentAuthTimestamp;
    try {
      console.log(
        JSON.stringify({
          level: 'debug',
          msg: 'api_post_body_parsed',
          hasConfirm: typeof confirm === 'boolean',
          hasRecent: typeof recentAuthTimestamp === 'number',
          recentType: typeof recentAuthTimestamp,
        }),
      );
    } catch {}
  } catch {
    try {
      console.warn(
        JSON.stringify({ level: 'warn', msg: 'api_post_guard_fail', reason: 'invalid_json' }),
      );
    } catch {}
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!confirm) {
    try {
      console.warn(
        JSON.stringify({ level: 'warn', msg: 'api_post_guard_fail', reason: 'missing_confirmation' }),
      );
    } catch {}
    return NextResponse.json({ error: 'Confirmation required' }, { status: 400 });
  }
  const ts = Number(recentAuthTimestamp);
  if (!Number.isFinite(ts) || Date.now() - ts > RECENT_MS) {
    try {
      console.warn(
        JSON.stringify({
          level: 'warn',
          msg: 'api_post_guard_fail',
          reason: 'stale_recent_auth',
          now: Date.now(),
          recentAuthAt: ts,
        }),
      );
    } catch {}
    return NextResponse.json({ error: 'Re-authentication required' }, { status: 401 });
  }

  // Ownership/auth check
  try {
    console.log(
      JSON.stringify({ level: 'debug', msg: 'api_post_verify_access_start', postId }),
    );
  } catch {}
  const hasAccess = await verifyAccessToPost(postId);
  try {
    console.log(
      JSON.stringify({ level: 'debug', msg: 'api_post_verify_access_result', hasAccess }),
    );
  } catch {}
  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Collect media filenames BEFORE deleting post, to determine cross-references
  const mediaRows = await prisma.visualMedia.findMany({
    where: { postId },
    select: { fileName: true },
  });
  const filenames = mediaRows.map((m) => m.fileName);

  // Determine which files are referenced elsewhere (by other posts or as profile/cover photos)
  let toDelete: string[] = filenames;
  if (filenames.length > 0) {
    const [otherPostRefs, userPhotoRefs] = await Promise.all([
      prisma.visualMedia.findMany({
        where: { fileName: { in: filenames }, NOT: { postId } },
        select: { fileName: true },
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { profilePhoto: { in: filenames } },
            { coverPhoto: { in: filenames } },
          ],
        },
        select: { profilePhoto: true, coverPhoto: true },
      }),
    ]);

    const otherSet = new Set(otherPostRefs.map((r) => r.fileName));
    const userSet = new Set<string>();
    for (const u of userPhotoRefs) {
      if (u.profilePhoto) userSet.add(u.profilePhoto);
      if (u.coverPhoto) userSet.add(u.coverPhoto);
    }
    const keepSet = new Set<string>([...otherSet, ...userSet]);
    const kept = filenames.filter((f) => keepSet.has(f));
    toDelete = filenames.filter((f) => !keepSet.has(f));
    try {
      console.log(
        JSON.stringify({
          level: 'debug',
          msg: 'media_reference_scan',
          total: filenames.length,
          keep: kept.length,
          delete: toDelete.length,
        }),
      );
    } catch {}
  }

  // Delete the `post` (its VisualMedia rows are removed via cascade)
  try {
    console.log(JSON.stringify({ level: 'debug', msg: 'db_delete_start', postId }));
  } catch {}
  const deleted = await prisma.post.delete({
    select: { id: true },
    where: { id: postId },
  });
  try {
    console.log(JSON.stringify({ level: 'info', msg: 'db_delete_result', ok: true, postId }));
  } catch {}

  // Best-effort S3 cleanup for files that are no longer referenced anywhere
  try {
    console.log(
      JSON.stringify({ level: 'debug', msg: 's3_cleanup_start', count: toDelete.length }),
    );
  } catch {}
  await Promise.all(
    toDelete.map(async (f) => {
      try {
        await deleteObject(f);
      } catch {
        // ignore individual delete failures
      }
    }),
  );
  try {
    console.log(JSON.stringify({ level: 'debug', msg: 's3_cleanup_result', ok: true }));
  } catch {}

  try {
    console.log(JSON.stringify({ level: 'info', msg: 'api_post_response', status: 200 }));
  } catch {}
  return NextResponse.json({ id: deleted.id });
}
