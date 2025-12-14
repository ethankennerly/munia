import { NextResponse } from 'next/server';
// Intentionally disabled bootstrap in codebase to avoid type coupling.

/**
 * Admin bootstrap endpoint (server-only):
 * If env ADMIN_BOOTSTRAP_USER_ID is set, promote that user to ADMIN on first call.
 * Guarded so it only works in non-production environments.
 */
export async function POST() {
  return NextResponse.json({ error: 'bootstrap_disabled' }, { status: 403 });
}
