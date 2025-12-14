import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/replay/admin';

const ROOT = path.join(process.cwd(), 'tmp', 'replay');

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const dir = path.join(ROOT, params.id);
  try {
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
    files.sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));
    let events: unknown[] = [];
    let meta: Record<string, unknown> = {};
    let startedAt = Infinity;
    let endedAt = 0;
    const jsons = await Promise.all(
      files.map(async (f) => {
        return JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')) as unknown as {
          startedAt?: number;
          endedAt?: number;
          meta?: Record<string, unknown>;
          events?: unknown[];
        };
      }),
    );
    for (const j of jsons) {
      if (!meta || Object.keys(meta).length === 0) meta = j.meta || {};
      events = events.concat(j.events || []);
      startedAt = Math.min(startedAt, Number(j.startedAt) || Date.now());
      endedAt = Math.max(endedAt, Number(j.endedAt) || 0);
    }
    if (startedAt === Infinity) startedAt = Date.now();
    return NextResponse.json({ id: params.id, startedAt, endedAt, meta, events });
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
