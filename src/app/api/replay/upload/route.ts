import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/replay/admin';
import prisma from '@/lib/prisma/prisma';
import { logger } from '@/lib/logging';
import type { Prisma } from '@prisma/client';

type EncodedAction = {
  t: string;
  ts: number;
  d: Record<string, unknown>;
};

type UploadBody = {
  sessionId: string;
  actions: EncodedAction[];
};

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    logger.warn({ msg: 'replay_upload_unauthorized' });
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: UploadBody;
  try {
    body = (await req.json()) as UploadBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { sessionId, actions } = body;

  if (!sessionId || !Array.isArray(actions) || actions.length === 0) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  try {
    // Upsert session (create if doesn't exist, update endedAt)
    await prisma.replaySession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        userId: user.userId,
        startedAt: new Date(actions[0].ts),
        endedAt: new Date(actions[actions.length - 1].ts),
      },
      update: {
        endedAt: new Date(actions[actions.length - 1].ts),
      },
    });

    // Insert actions (already encoded, store as-is)
    await prisma.replayAction.createMany({
      data: actions.map((action) => ({
        sessionId,
        datetimestamp: new Date(action.ts), // Convert milliseconds to DateTime
        type: action.t, // Already encoded ('r', 'a', 'sc', etc.)
        data: action.d as unknown as Prisma.InputJsonValue, // Already encoded (short keys)
      })),
    });

    logger.info({
      msg: 'replay_actions_uploaded',
      sessionId,
      userId: user.userId,
      actionsCount: actions.length,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({
      msg: 'replay_upload_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId,
    });
    return NextResponse.json({ error: 'database_error' }, { status: 500 });
  }
}
