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
    // Look for actions.json (new format) or chunk files (old format)
    const actionsFile = path.join(dir, 'actions.json');
    let actions: unknown[] = [];
    
    try {
      // Try new format first
      const content = await fs.readFile(actionsFile, 'utf8');
      actions = JSON.parse(content);
    } catch {
      // Fallback: try old chunk format for backward compatibility
      const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
      files.sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));
      
      for (const f of files) {
        const json = JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')) as unknown as {
          events?: unknown[];
        };
        if (json.events) {
          actions = actions.concat(json.events);
        }
      }
    }
    
    return NextResponse.json({ id: params.id, actions });
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
