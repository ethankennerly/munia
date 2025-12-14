import 'server-only';
import { auth } from '@/auth';
import { logger } from '@/lib/logging';
import prisma from '@/lib/prisma/prisma';

/**
 * Admin utility based on a simple environment allowlist.
 * Set IS_ADMIN_EMAILS to a comma-separated list of admin emails.
 */
type SessionUser = { id: string; email?: string };

export async function requireAdmin(): Promise<{ userId: string; email?: string } | null> {
  const session = await auth();
  if (!session?.user) {
    if (process.env.NODE_ENV !== 'production') logger.warn({ msg: 'admin_check_no_session' });
    return null;
  }
  const user = session.user as SessionUser;
  // Derive the most reliable server-side identifier for DB lookups.
  const idFromSession = user.id;
  const idForDb = typeof idFromSession === 'string' && idFromSession.length > 0 ? idFromSession : undefined;
  const email = user.email;
  // Primary: DB role check (preferred, non-spoofable)
  try {
    const dbUser = idForDb ? await prisma.user.findUnique({ where: { id: idForDb } }) : null;
    const role = (dbUser as unknown as { role?: string })?.role;
    if (role === 'ADMIN') {
      const dbEmail = (dbUser as unknown as { email?: string })?.email;
      if (process.env.NODE_ENV !== 'production')
        logger.debug({ msg: 'admin_check_db_role', userId: idForDb, role });
      return { userId: idForDb!, email: dbEmail || email };
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production')
      logger.error({ msg: 'admin_check_db_error', error: (e as Error).message });
  }

  // Fallback: env allowlists (IDs first, then verified IdP email)
  const idList = (process.env.IS_ADMIN_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const emailList = (process.env.IS_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const isAdminById = !!idForDb && idList.includes(idForDb);
  const isAdminByEmail = !!email && emailList.includes(email.toLowerCase());
  const isAdmin = isAdminById || isAdminByEmail;
  if (process.env.NODE_ENV !== 'production')
    logger.debug({
      msg: 'admin_check_env',
      userId: idForDb,
      email,
      idList,
      emailList,
      isAdminById,
      isAdminByEmail,
      isAdmin,
    });
  if (isAdmin && idForDb) return { userId: idForDb, email };
  return null;
}

export async function requireAuth(): Promise<{ userId: string; email?: string } | null> {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as SessionUser;
  const { id, email } = user;
  return { userId: id, email };
}
