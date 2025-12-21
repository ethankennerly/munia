import 'server-only';
import { auth } from '@/auth';
import { logger } from '@/lib/logging';
import prisma from '@/lib/prisma/prisma';

/**
 * Admin utility that checks the database for ADMIN role.
 * Users must have role: 'ADMIN' in the database to access admin routes.
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
  const { id: idFromSession, email } = user;
  const idForDb = typeof idFromSession === 'string' && idFromSession.length > 0 ? idFromSession : undefined;

  if (!idForDb) {
    if (process.env.NODE_ENV !== 'production') logger.warn({ msg: 'admin_check_no_user_id', userId: idFromSession });
    return null;
  }

  // Check database for ADMIN role
  try {
    const dbUser = await prisma.user.findUnique({ where: { id: idForDb } });
    if (!dbUser) {
      if (process.env.NODE_ENV !== 'production') logger.debug({ msg: 'admin_check_user_not_found', userId: idForDb });
      return null;
    }
    // Compare with string literal 'ADMIN' (Role enum value from database)
    if (dbUser.role === 'ADMIN') {
      if (process.env.NODE_ENV !== 'production')
        logger.debug({ msg: 'admin_check_db_role', userId: idForDb, role: dbUser.role });
      return { userId: idForDb, email: dbUser.email || email };
    }
    if (process.env.NODE_ENV !== 'production')
      logger.debug({ msg: 'admin_check_not_admin', userId: idForDb, role: dbUser.role });
  } catch (e) {
    if (process.env.NODE_ENV !== 'production')
      logger.error({ msg: 'admin_check_db_error', error: (e as Error).message });
  }

  return null;
}

export async function requireAuth(): Promise<{ userId: string; email?: string } | null> {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as SessionUser;
  const { id, email } = user;
  return { userId: id, email };
}
