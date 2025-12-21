import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/replay/admin';
import { logger } from '@/lib/logging';

// Support both old chunk format and new actions format during transition
type UploadBody = 
  | {
      // New format: actions array
      sessionId: string;
      actions: unknown[];
      timestamp?: number;
    }
  | {
      // Old format: chunked events (for backward compatibility)
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
  if (!user) {
    if (process.env.NODE_ENV !== 'production')
      logger.warn({ msg: 'replay_upload_unauthorized' });
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: UploadBody;
  try {
    body = (await req.json()) as UploadBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { sessionId } = body;
  if (!sessionId) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const dir = path.join(ROOT, sessionId);
  await fs.mkdir(dir, { recursive: true });

  // Handle new format (actions array)
  if ('actions' in body && Array.isArray(body.actions)) {
    const actionsFile = path.join(dir, 'actions.json');
    
    // Append to existing actions or create new
    let existing: unknown[] = [];
    try {
      existing = JSON.parse(await fs.readFile(actionsFile, 'utf8'));
    } catch {
      // File doesn't exist yet, start fresh
    }
    
    existing.push(...body.actions);
    await fs.writeFile(actionsFile, JSON.stringify(existing));
    
    logger.info({
      msg: 'replay_actions_uploaded',
      sessionId,
      userId: user.userId,
      actionsCount: body.actions.length,
    });
    
    return NextResponse.json({ ok: true });
  }

  // Handle old format (chunked events) for backward compatibility
  if ('chunkIndex' in body && typeof body.chunkIndex === 'number' && Array.isArray(body.events)) {
    const file = path.join(dir, `${body.chunkIndex}.json`);
    const payload = {
      userId: user.userId,
      sessionId,
      chunkIndex: body.chunkIndex,
      startedAt: body.startedAt ?? Date.now(),
      endedAt: body.endedAt ?? Date.now(),
      meta: body.meta ?? {},
      events: body.events,
    };
    await fs.writeFile(file, JSON.stringify(payload));
    
    // Log session started (first chunk)
    if (body.chunkIndex === 0) {
      logger.info({
        msg: 'replay_session_started',
        sessionId,
        userId: user.userId,
        eventsCount: body.events.length,
      });
    }
    
    logger.info({
      msg: 'replay_chunk_uploaded',
      sessionId,
      chunkIndex: body.chunkIndex,
      userId: user.userId,
      eventsCount: body.events.length,
    });
    
    // Log session stopped if indicated
    if (body.meta?.sessionEnded === true) {
      logger.info({
        msg: 'replay_session_stopped',
        sessionId,
        userId: user.userId,
        chunkIndex: body.chunkIndex,
        eventsCount: body.events.length,
      });
    }
    
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
}
