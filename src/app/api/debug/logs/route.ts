import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/debug/logs
 * Receives diagnostic logs from client-side components for debugging.
 * Logs are written to .cursor/debug.log in NDJSON format.
 * Works from remote devices (no authentication required for debugging).
 * Only enabled in development environment.
 */
export async function POST(req: NextRequest) {
  const debugLogEnabled = process.env.NODE_ENV === 'development' || process.env.DEBUG_LOG_ENABLED === 'true';
  if (!debugLogEnabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { location, message, data, timestamp, sessionId, runId, hypothesisId } = body;

    // Validate required fields
    if (!location || !message) {
      return NextResponse.json({ error: 'Missing required fields: location, message' }, { status: 400 });
    }

    // Create log entry in NDJSON format
    const logEntry = {
      id: `log_${timestamp}_${Math.random().toString(36).substring(7)}`,
      timestamp: timestamp || Date.now(),
      location,
      message,
      data: data || {},
      sessionId: sessionId || 'unknown',
      runId: runId || 'unknown',
      hypothesisId: hypothesisId || null,
    };

    if (process.env.NODE_ENV === 'development') {
      const logDir = join(process.cwd(), '.cursor');
      const logFile = join(logDir, 'debug.log');
      if (!existsSync(logDir)) {
        await mkdir(logDir, { recursive: true });
      }
      await writeFile(logFile, JSON.stringify(logEntry) + '\n', { flag: 'a' });
    }

    logger.debug({
      msg: 'debug_log_received',
      ...logEntry,
    });

    return NextResponse.json({ ok: true, logged: true });
  } catch (error) {
    logger.error({
      msg: 'debug_log_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}
