import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/replay/admin';
import { getSessions } from '@/lib/replay/getSessions';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const sessions = await getSessions();
  return NextResponse.json({ sessions });
}
