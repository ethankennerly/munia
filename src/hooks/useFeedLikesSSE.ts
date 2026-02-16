import { useEffect, useRef, useMemo } from 'react';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { GetPost, GetComment, PostIds } from '@/types/definitions';

interface PostLikesEvent {
  postId: number;
  postLikes: number;
  comments: number;
}

interface CommentLikesEvent {
  postId: number;
  comments: { commentId: number; commentLikes: number }[];
}

/**
 * Opens an EventSource to `/api/feed/stream?postIds=…` and pushes
 * like-count updates directly into the React Query cache.
 *
 * @param postIds - The IDs of posts currently rendered in the feed.
 *   When this list changes the SSE connection is re-established.
 */
export function useFeedLikesSSE(postIds: number[]) {
  const queryClient = useQueryClient();

  // Stabilise the array reference so the effect only re-runs when the
  // actual set of IDs changes (not on every render).
  const key = postIds.sort((a, b) => a - b).join(',');
  const stableIds = useMemo(() => postIds, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (stableIds.length === 0) return;

    const url = `/api/feed/stream?postIds=${stableIds.join(',')}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('postLikes', (e: MessageEvent) => {
      const { postId, postLikes, comments } = JSON.parse(e.data) as PostLikesEvent;

      queryClient.setQueryData<GetPost>(['posts', postId], (old) => {
        if (!old) return old;
        // Don't overwrite if the counts are already the same (avoids re-render)
        if (old._count.postLikes === postLikes && old._count.comments === comments) return old;
        return { ...old, _count: { ...old._count, postLikes, comments } };
      });
    });

    es.addEventListener('commentLikes', (e: MessageEvent) => {
      const { postId, comments } = JSON.parse(e.data) as CommentLikesEvent;

      queryClient.setQueryData<GetComment[]>(['posts', postId, 'comments'], (oldComments) => {
        if (!oldComments) return oldComments;

        const likesMap = new Map(comments.map((c) => [c.commentId, c.commentLikes]));
        let changed = false;

        const updated = oldComments.map((comment) => {
          const newLikes = likesMap.get(comment.id);
          if (newLikes !== undefined && newLikes !== comment._count.commentLikes) {
            changed = true;
            return { ...comment, _count: { ...comment._count, commentLikes: newLikes } };
          }
          return comment;
        });

        return changed ? updated : oldComments;
      });
    });

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [stableIds, queryClient]);
}

/**
 * Extract flattened post IDs from an infinite query's cached data.
 * Useful for feeding into {@link useFeedLikesSSE}.
 */
export function useVisiblePostIds(queryKey: readonly unknown[]): number[] {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<InfiniteData<PostIds>>(queryKey);

  return useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flat().map((p) => p.id);
  }, [data]);
}
