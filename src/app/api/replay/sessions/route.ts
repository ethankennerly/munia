import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/replay/admin';

const ROOT = path.join(process.cwd(), 'tmp', 'replay');

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  // List session directories
  let entries: string[] = [];
  try {
    const dir = await fs.readdir(ROOT, { withFileTypes: true });
    entries = dir.filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    // no tmp dir yet
    entries = [];
  }

  const sessions = await Promise.all(
    entries.map(async (id) => {
      const files = await fs.readdir(path.join(ROOT, id));
      let startedAt = Infinity;
      let endedAt = 0;
      // parallel stat + optional read start/end
      const stats = await Promise.all(
        files.map(async (f) => {
          const p = path.join(ROOT, id, f);
          const s = await fs.stat(p);
          let st = Number.POSITIVE_INFINITY;
          let en = 0;
          try {
            const json = JSON.parse(await fs.readFile(p, 'utf8')) as unknown as {
              startedAt?: number;
              endedAt?: number;
            };
            st = Number(json.startedAt) || st;
            en = Number(json.endedAt) || en;
          } catch {
            // ignore
          }
          return { size: s.size, st, en };
        }),
      );
      const bytes = stats.reduce((acc, cur) => acc + cur.size, 0);
      for (const it of stats) {
        startedAt = Math.min(startedAt, it.st);
        endedAt = Math.max(endedAt, it.en);
      }
      if (startedAt === Infinity) startedAt = Date.now();
      return { id, bytes, startedAt, endedAt };
    }),
  );

  return NextResponse.json({ sessions });
}
