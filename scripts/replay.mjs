#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const ROOT = path.join(process.cwd(), 'tmp', 'replay');

async function list() {
  try {
    const dir = await fs.readdir(ROOT, { withFileTypes: true });
    const ids = dir.filter((d) => d.isDirectory()).map((d) => d.name);
    for (const id of ids) {
      const files = await fs.readdir(path.join(ROOT, id));
      let bytes = 0;
      for (const f of files) bytes += (await fs.stat(path.join(ROOT, id, f))).size;
      console.log(`${id}\t${(bytes / 1024).toFixed(1)}KB`);
    }
  } catch {
    console.log('No sessions.');
  }
}

async function show(id) {
  const dir = path.join(ROOT, id);
  try {
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
    files.sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
    let events = [];
    for (const f of files) {
      const json = JSON.parse(await fs.readFile(path.join(dir, f), 'utf8'));
      events = events.concat(json.events || []);
    }
    console.log(JSON.stringify({ id, eventsCount: events.length }));
  } catch {
    console.error('Session not found');
    process.exit(1);
  }
}

const [,, cmd, arg] = process.argv;
if (cmd === 'list') {
  await list();
} else if (cmd === 'show' && arg) {
  await show(arg);
} else {
  console.log('Usage: replay.mjs <list|show <id>>');
  process.exit(2);
}
