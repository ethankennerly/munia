import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteAccount } from '@/lib/account/deleteAccount';
import { logger } from '@/lib/logging';

// Module-load log to verify route registration
logger.info({ msg: 'api_account_module_loaded', at: new Date().toISOString() });

// 5 minutes in ms
const RECENT_MS = 5 * 60 * 1000;

export async function DELETE(req: Request) {
  logger.info({ msg: 'api_account_delete_enter', url: req.url, at: new Date().toISOString() });

  const session = await auth();
  const userId = session?.user?.id ?? null;
  if (!userId) {
    logger.warn({ msg: 'api_account_guard_fail', reason: 'unauthenticated' });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate recent-auth timestamp from client (MVP approach)
  const contentType = req.headers.get('content-type');
  logger.debug({ msg: 'api_account_body_parse_attempt', contentType: contentType || null });
  let recentAuthTimestamp: unknown;
  let confirm: unknown;
  try {
    const body = (await req.json()) as { recentAuthTimestamp?: unknown; confirm?: unknown };
    recentAuthTimestamp = body?.recentAuthTimestamp;
    confirm = body?.confirm;
    logger.debug({
      msg: 'api_account_body_parsed',
      hasConfirm: typeof confirm === 'boolean',
      hasRecent: typeof recentAuthTimestamp === 'number',
    });
  } catch (e) {
    logger.warn({ msg: 'api_account_guard_fail', reason: 'invalid_json' });
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!confirm) {
    logger.warn({ msg: 'api_account_guard_fail', reason: 'missing_confirmation' });
    return NextResponse.json({ error: 'Confirmation required' }, { status: 400 });
  }

  const ts = Number(recentAuthTimestamp);
  if (!Number.isFinite(ts) || Date.now() - ts > RECENT_MS) {
    logger.warn({ msg: 'api_account_guard_fail', reason: 'stale_recent_auth', now: Date.now(), recentAuthAt: ts });
    return NextResponse.json({ error: 'Re-authentication required' }, { status: 401 });
  }

  // Audit: deletion requested
  logger.info({
    event: 'UserDeletionRequested',
    userId,
    at: new Date().toISOString(),
  });

  try {
    logger.info({ msg: 'account_delete_start', userId });
    const result = await deleteAccount(userId);
    logger.info({ msg: 'account_delete_complete', userId: result.deletedUserId });
    // Audit: deletion completed
    logger.info({
      event: 'UserDeleted',
      userId: result.deletedUserId,
      files: result.deletedFileNames.length,
      at: new Date().toISOString(),
    });
    logger.info({ msg: 'api_account_response', status: 200 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ msg: 'account_delete_error', err: (err as Error)?.message || String(err) });
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
