import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/replay/admin';
import prisma from '@/lib/prisma/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const actions = await prisma.replayAction.findMany({
      where: { sessionId: params.id },
      orderBy: { timestamp: 'asc' },
      select: { type: true, timestamp: true, data: true },
    });

    return NextResponse.json({
      id: params.id,
      actions: actions.map((a) => ({
        t: a.type, // Already encoded ('r', 'c', etc.)
        ts: Number(a.timestamp), // Convert BigInt to number
        d: a.data, // Already encoded (short keys)
      })),
    });
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
