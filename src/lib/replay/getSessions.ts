import 'server-only';
import prisma from '@/lib/prisma/prisma';

export type SessionInfo = {
  id: string;
  actionCount: number;
  startedAt: number;
  endedAt: number | null;
};

export async function getSessions(): Promise<SessionInfo[]> {
  const sessions = await prisma.replaySession.findMany({
    orderBy: { startedAt: 'desc' }, // Newest first
    select: {
      id: true,
      startedAt: true,
      endedAt: true,
      _count: {
        select: { actions: true },
      },
    },
  });

  return sessions.map((s) => ({
    id: s.id,
    actionCount: s._count.actions,
    startedAt: s.startedAt.getTime(),
    endedAt: s.endedAt?.getTime() || null,
  }));
}
