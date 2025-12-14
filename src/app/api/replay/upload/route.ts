import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/replay/admin';

type UploadBody = {
  sessionId: string;
  chunkIndex: number;
  events: unknown[];
  startedAt?: number;
  endedAt?: number;
  meta?: Record<string, unknown>;
};

const ROOT = path.join(process.cwd(), 'tmp', 'replay');

export async function POST(req: NextRequest) {
  // Require authenticated user
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: UploadBody;
  try {
    body = (await req.json()) as UploadBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { sessionId, chunkIndex, events, startedAt, endedAt, meta } = body;
  if (!sessionId || typeof chunkIndex !== 'number' || !Array.isArray(events)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const dir = path.join(ROOT, sessionId);
  const file = path.join(dir, `${chunkIndex}.json`);
  await fs.mkdir(dir, { recursive: true });
  const payload = {
    userId: user.userId,
    sessionId,
    chunkIndex,
    startedAt: startedAt ?? Date.now(),
    endedAt: endedAt ?? Date.now(),
    meta: meta ?? {},
    events,
  };
  await fs.writeFile(file, JSON.stringify(payload));
  return NextResponse.json({ ok: true });
}
