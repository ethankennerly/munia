/**
 * GET /api/feed/stream?postIds=1,2,3
 *
 * Server-Sent Events endpoint that pushes like-count changes for
 * the posts (and their comments) the client is currently displaying.
 *
 * Events:
 *   `postLikes`    — { postId, postLikes, comments }
 *   `commentLikes` — { postId, comments: [{ commentId, commentLikes }] }
 *
 * The client passes the visible post IDs as a comma-separated query param.
 * Only changed counts are pushed (delta-only).
 */
import { auth } from '@/auth';
import prisma from '@/lib/prisma/prisma';
import { NextRequest } from 'next/server';

const POLL_INTERVAL_MS = 5_000;
const MAX_POST_IDS = 50;

interface PostCounts {
  postLikes: number;
  comments: number;
}

interface CommentCounts {
  commentId: number;
  commentLikes: number;
}

async function getPostCounts(postIds: number[]): Promise<Map<number, PostCounts>> {
  const posts = await prisma.post.findMany({
    where: { id: { in: postIds } },
    select: {
      id: true,
      _count: { select: { postLikes: true, comments: true } },
    },
  });
  const map = new Map<number, PostCounts>();
  for (const p of posts) {
    map.set(p.id, { postLikes: p._count.postLikes, comments: p._count.comments });
  }
  return map;
}

async function getCommentCounts(postIds: number[]): Promise<Map<number, CommentCounts[]>> {
  const comments = await prisma.comment.findMany({
    where: { postId: { in: postIds }, parentId: null },
    select: {
      id: true,
      postId: true,
      _count: { select: { commentLikes: true } },
    },
  });
  const map = new Map<number, CommentCounts[]>();
  for (const c of comments) {
    const arr = map.get(c.postId) ?? [];
    arr.push({ commentId: c.id, commentLikes: c._count.commentLikes });
    map.set(c.postId, arr);
  }
  return map;
}

function postCountsEqual(a: PostCounts | undefined, b: PostCounts | undefined): boolean {
  if (!a || !b) return false;
  return a.postLikes === b.postLikes && a.comments === b.comments;
}

function commentCountsEqual(a: CommentCounts[] | undefined, b: CommentCounts[] | undefined): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].commentId !== b[i].commentId || a[i].commentLikes !== b[i].commentLikes) return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const rawIds = req.nextUrl.searchParams.get('postIds') ?? '';
  const postIds = rawIds
    .split(',')
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n))
    .slice(0, MAX_POST_IDS);

  if (postIds.length === 0) {
    return new Response('Missing postIds', { status: 400 });
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

      let prevPostCounts = new Map<number, PostCounts>();
      let prevCommentCounts = new Map<number, CommentCounts[]>();

      const poll = async () => {
        while (!cancelled) {
          try {
            const [postCounts, commentCounts] = await Promise.all([getPostCounts(postIds), getCommentCounts(postIds)]);

            // Push post-level changes
            for (const [postId, counts] of postCounts) {
              if (!postCountsEqual(prevPostCounts.get(postId), counts)) {
                send('postLikes', { postId, ...counts });
              }
            }

            // Push comment-level changes
            for (const [postId, counts] of commentCounts) {
              if (!commentCountsEqual(prevCommentCounts.get(postId), counts)) {
                send('commentLikes', { postId, comments: counts });
              }
            }

            prevPostCounts = postCounts;
            prevCommentCounts = commentCounts;
          } catch {
            // DB error — skip this cycle
          }

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
      'X-Accel-Buffering': 'no',
    },
  });
}
