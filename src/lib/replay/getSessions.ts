import 'server-only';
import fs from 'fs/promises';
import path from 'path';

const ROOT = path.join(process.cwd(), 'tmp', 'replay');

export type SessionInfo = {
  id: string;
  bytes: number;
  startedAt: number;
  endedAt: number;
};

export async function getSessions(): Promise<SessionInfo[]> {
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
      const dir = path.join(ROOT, id);
      const files = await fs.readdir(dir);
      let startedAt = Infinity;
      let endedAt = 0;
      let bytes = 0;
      
      // Check for new format (actions.json) or old format (chunk files)
      const actionsFile = path.join(dir, 'actions.json');
      try {
        // New format: single actions.json file
        const stat = await fs.stat(actionsFile);
        bytes = stat.size;
        try {
          const content = await fs.readFile(actionsFile, 'utf8');
          const actions = JSON.parse(content) as unknown[];
          if (actions.length > 0) {
            const first = actions[0] as { timestamp?: number };
            const last = actions[actions.length - 1] as { timestamp?: number };
            startedAt = first.timestamp || stat.mtimeMs;
            endedAt = last.timestamp || stat.mtimeMs;
          } else {
            // Empty file, use file mtime
            startedAt = stat.mtimeMs;
            endedAt = stat.mtimeMs;
          }
        } catch {
          // Couldn't parse, use file mtime
          startedAt = stat.mtimeMs;
          endedAt = stat.mtimeMs;
        }
      } catch {
        // Old format: chunk files
        const stats = await Promise.all(
          files.map(async (f) => {
            const p = path.join(dir, f);
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
        bytes = stats.reduce((acc, cur) => acc + cur.size, 0);
        for (const it of stats) {
          startedAt = Math.min(startedAt, it.st);
          endedAt = Math.max(endedAt, it.en);
        }
      }
      
      if (startedAt === Infinity) startedAt = Date.now();
      return { id, bytes, startedAt, endedAt };
    }),
  );
  
  // Sort by startedAt DESC (newest first)
  sessions.sort((a, b) => b.startedAt - a.startedAt);

  return sessions;
}
