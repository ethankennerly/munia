/**
 * GET /api/users/:userId/notifications/stream
 *
 * Server-Sent Events endpoint that pushes notification count changes
 * to the client, replacing client-side polling.
 *
 * Uses Node.js runtime because Prisma Client requires Node.js APIs.
 * To switch to Edge Runtime (lower memory per connection on Vercel),
 * set up Prisma Accelerate and change the import to '@prisma/client/edge'.
 *
 * On Vercel, serverless functions have a max duration (60s Pro, 300s Enterprise).
 * When the connection drops, the browser's EventSource auto-reconnects.
 */
import { auth } from '@/auth';
import prisma from '@/lib/prisma/prisma';
import { NextRequest } from 'next/server';

const POLL_INTERVAL_MS = 5_000;

async function getUnreadCount(userId: string): Promise<number> {
  return prisma.activity.count({
    where: {
      isNotificationRead: false,
      targetUserId: userId,
      sourceUserId: { not: userId },
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  // Verify the authenticated user matches the URL param
  const urlUserId = req.nextUrl.pathname.split('/').at(-3); // .../users/{id}/notifications/stream
  if (urlUserId !== userId) {
    return new Response('Forbidden', { status: 403 });
  }

  let cancelled = false;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          cancelled = true;
        }
      };

      let previousCount = -1;

      const poll = async () => {
        while (!cancelled) {
          try {
            const count = await getUnreadCount(userId);
            if (count !== previousCount) {
              send('count', count);
              previousCount = count;
            }
          } catch {
            // DB error — skip this cycle, try again next interval
          }

          // Wait before next poll
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      poll();
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering
    },
  });
}
