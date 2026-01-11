import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/replay/admin';
import prisma from '@/lib/prisma/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const { id } = await params;
    const actions = await prisma.replayAction.findMany({
      where: { sessionId: id },
      orderBy: { datetimestamp: 'asc' },
      select: { type: true, datetimestamp: true, data: true },
    });

    return NextResponse.json({
      id,
      actions: actions.map((a) => ({
        t: a.type, // Already encoded ('r', 'c', etc.)
        ts: a.datetimestamp.getTime(), // Convert DateTime to milliseconds
        d: a.data, // Already encoded (short keys)
      })),
    });
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
