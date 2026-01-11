import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteAccount } from '@/lib/account/deleteAccount';
import { logger } from '@/lib/logging';

// 5 minutes in ms
const RECENT_MS = 5 * 60 * 1000;

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate recent-auth timestamp from client (MVP approach)
  try {
    const { recentAuthTimestamp, confirm } = (await req.json()) as {
      recentAuthTimestamp?: unknown;
      confirm?: unknown;
    };
    if (!confirm) {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 });
    }
    const ts = Number(recentAuthTimestamp);
    if (!Number.isFinite(ts) || Date.now() - ts > RECENT_MS) {
      return NextResponse.json({ error: 'Re-authentication required' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Audit: deletion requested
  logger.info({ event: 'UserDeletionRequested', userId: session.user.id, at: new Date().toISOString() });

  try {
    const result = await deleteAccount(session.user.id);
    // Audit: deletion completed
    logger.info({
      event: 'UserDeleted',
      userId: result.deletedUserId,
      files: result.deletedFileNames.length,
      at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ msg: 'User deletion failed', err: (err as Error).message });
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
