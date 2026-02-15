'use client';

import { InfiniteData, QueryKey, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { GetPost, PostIds } from '@/types/definitions';
import { useCallback, useEffect, useMemo } from 'react';
import { NO_PREV_DATA_LOADED, POSTS_PER_PAGE } from '@/constants';
import { chunk } from 'lodash';
import { useShouldAnimate } from '@/hooks/useShouldAnimate';
import { logger } from '@/lib/logging-client';
import BidirectionalScroll from './ui/BidirectionalScroll';
import { Post } from './Post';
import { PostSkeletonList } from './PostSkeleton';

// If the `type` is 'profile' or 'feed', the `userId` property is required
// If the `type` is 'hashtag', the `hashtag` property is required
export type PostsProps =
  | {
      type: 'hashtag';
      userId?: undefined;
      hashtag: string;
    }
  | {
      type: 'profile' | 'feed';
      userId: string;
      hashtag?: undefined;
    };

export function Posts({ type, hashtag, userId }: PostsProps) {
  const qc = useQueryClient();
  // Need to memoize `queryKey`, so when used in a dependency array, it won't trigger the `useEffect`/`useCallback`
  const queryKey = useMemo(
    () => (type === 'hashtag' ? ['posts', { hashtag }] : ['users', userId, 'posts', { type }]),
    [type, userId, hashtag],
  );
  const { shouldAnimate } = useShouldAnimate();

  const queryResult = useInfiniteQuery<PostIds, Error, InfiniteData<PostIds>, QueryKey>({
    queryKey,
    initialPageParam: { cursor: 0, direction: 'forward' },
    queryFn: async ({ pageParam, signal: tanstackSignal }) => {
      const fetchAsync = async (combinedSignal?: AbortSignal) => {
        // Handle both object format and legacy number format for backward compatibility
        let cursor: number;
        let direction: string;
        if (typeof pageParam === 'object' && pageParam !== null && 'cursor' in pageParam) {
          cursor = (pageParam as { cursor: number; direction: string }).cursor;
          direction = (pageParam as { cursor: number; direction: string }).direction;
        } else if (typeof pageParam === 'number') {
          // Legacy format: just a number (post ID) - default to forward direction
          cursor = pageParam;
          direction = 'forward';
          logger.warn(
            {
              message: 'Legacy pageParam format detected (number) - this should not happen',
              pageParam,
              inferredCursor: cursor,
              inferredDirection: direction,
              type,
              userId,
              hashtag,
            },
            'SCROLL',
          );
        } else {
          // Fallback for initial load or invalid format
          cursor = 0;
          direction = 'forward';
          logger.warn(
            {
              message: 'Invalid or missing pageParam format, using defaults',
              pageParam,
              pageParamType: typeof pageParam,
              inferredCursor: cursor,
              inferredDirection: direction,
              type,
              userId,
              hashtag,
            },
            'SCROLL',
          );
        }
        const isForwards = direction === 'forward';
        const isBackwards = !isForwards;
        const params = new URLSearchParams('');

        // If the direction is 'backwards', load all new posts by setting a high `limit`
        params.set('limit', isForwards ? POSTS_PER_PAGE.toString() : '100');
        params.set('cursor', cursor.toString());
        params.set('sort-direction', isForwards ? 'desc' : 'asc');

        const fetchUrl =
          type === 'hashtag'
            ? `/api/posts/hashtag/${hashtag}`
            : `/api/users/${userId}/${type === 'profile' ? 'posts' : 'feed'}`;

        const fetchQuery = `${fetchUrl}?${params.toString()}`;

        logger.info(
          {
            message: 'Starting fetch',
            fetchUrl,
            fetchQuery,
            cursor,
            direction,
            isForwards,
            isBackwards,
            type,
            hashtag,
            userId,
            signalAborted: combinedSignal?.aborted,
          },
          'SCROLL',
        );

        const res = await fetch(fetchQuery, { signal: combinedSignal });

        logger.info(
          {
            message: 'Fetch response received',
            status: res.status,
            statusText: res.statusText,
            ok: res.ok,
            fetchUrl,
          },
          'SCROLL',
        );

        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unable to read error response');
          logger.info(
            {
              message: 'Fetch failed',
              status: res.status,
              statusText: res.statusText,
              errorText,
              fetchUrl,
            },
            'SCROLL',
          );
          throw new Error(`Failed to load posts: ${res.status} ${res.statusText}`);
        }

        const posts = (await res.json()) as GetPost[];

        logger.info(
          {
            message: 'Posts parsed',
            postCount: posts.length,
            fetchUrl,
          },
          'SCROLL',
        );

        if (!posts.length && isBackwards) {
          // Prevent React Query from 'prepending' the data with an empty array
          throw new Error(NO_PREV_DATA_LOADED);
        }

        const postIds = posts.map((post) => {
          // Set query data for each `post`, these queries will be used by the <Post> component
          qc.setQueryData(['posts', post.id], post);

          // Check if post exists in current query data from cache
          const currentData = qc.getQueryData<InfiniteData<PostIds>>(queryKey);
          const currentPostId = currentData?.pages.flat().find(({ id }) => id === post.id);

          return {
            id: post.id,
            commentsShown: currentPostId?.commentsShown || false,
          };
        });
        // When the direction is 'backwards', the `postIds` are in ascending order
        // Reverse it so that the latest post comes first in the array
        return isForwards ? postIds : postIds.reverse();
      };

      // 1. Create a hard deadline for the WHOLE operation (headers + body)
      // const totalTimeoutSignal = AbortSignal.timeout(4000);

      // 2. Combine with TanStack's signal to prevent memory leaks
      // const combinedSignal = (AbortSignal as any).any([tanstackSignal, totalTimeoutSignal]);

      try {
        return await fetchAsync(tanstackSignal);
      } catch (err: unknown) {
        // AbortError is a normal cancellation from React Query - don't treat as error
        if (err instanceof Error && err.name === 'AbortError') {
          // Re-throw as AbortError so React Query knows it's a cancellation, not a real error
          throw err;
        }
        // NO_PREV_DATA_LOADED means there's no more data in backward direction - not an error
        if (err instanceof Error && err.message === NO_PREV_DATA_LOADED) {
          // Re-throw so React Query knows there's no more data, but don't log as error
          throw err;
        }
        // TimeoutError should be treated as an error
        if (err instanceof Error && err.name === 'TimeoutError') {
          logger.error(
            {
              message: 'TimeoutError in Posts queryFn',
              errorName: err.name,
              errorMessage: err.message,
              stack: err.stack,
              pageParam,
              type,
              hashtag,
              userId,
            },
            'SCROLL',
          );
          throw new Error('Request timed out. Please try again.');
        }
        // Log all other errors with detailed diagnostics
        logger.error(
          {
            message: 'Error in Posts queryFn',
            errorName: err instanceof Error ? err.name : 'Unknown',
            errorMessage: err instanceof Error ? err.message : String(err),
            errorType: typeof err,
            errorConstructor: err instanceof Error ? err.constructor.name : undefined,
            stack: err instanceof Error ? err.stack : undefined,
            pageParam,
            type,
            hashtag,
            userId,
            queryKey: queryKey.toString(),
          },
          'SCROLL',
        );
        throw err;
      }
    },
    getNextPageParam: (lastPage) => {
      // Guard: lastPage might be undefined or non-array in edge cases (e.g., optimistic updates)
      if (!Array.isArray(lastPage) || lastPage.length === 0) return undefined;

      // If the API returned fewer posts than requested, we've reached the end
      // This is a heuristic for cursor-based pagination - if we asked for POSTS_PER_PAGE
      // but got fewer, there are no more posts to load
      if (lastPage.length < POSTS_PER_PAGE) {
        logger.info(
          {
            message: 'getNextPageParam: Reached end (fewer posts than requested)',
            lastPageLength: lastPage.length,
            postsPerPage: POSTS_PER_PAGE,
            type,
            userId,
            hashtag,
          },
          'SCROLL',
        );
        return undefined;
      }

      // Return object with cursor and direction for forward pagination (older items)
      const lastPostId = lastPage[lastPage.length - 1]?.id;
      if (!lastPostId) {
        logger.info(
          {
            message: 'getNextPageParam: No valid post ID found in lastPage',
            lastPageLength: lastPage.length,
            type,
            userId,
            hashtag,
          },
          'SCROLL',
        );
        return undefined;
      }
      return { cursor: lastPostId, direction: 'forward' };
    },
    getPreviousPageParam: (firstPage) => {
      // Guard against undefined/non-array firstPage
      if (!Array.isArray(firstPage) || firstPage.length === 0) return undefined;

      // Return object with cursor and direction for backward pagination (newer items)
      const firstPostId = firstPage[0]?.id;
      if (!firstPostId) {
        logger.info(
          {
            message: 'getPreviousPageParam: No valid post ID found in firstPage',
            firstPageLength: firstPage.length,
            type,
            userId,
            hashtag,
          },
          'SCROLL',
        );
        return undefined;
      }
      return { cursor: firstPostId, direction: 'backward' };
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 60000 * 10,
    retry: 2,
  });

  useEffect(() => {
    // Reset the queries when the page has just been pushed, this is to account
    // for changes in the user's follows, e.g. if they start following people,
    // their posts must be shown in the user's feed
    if (shouldAnimate) {
      // Need to manually reset as the `staleTime` is set to `Infinity`
      qc.resetQueries({ queryKey, exact: true });
    }
  }, [qc, queryKey, shouldAnimate]);

  const toggleComments = useCallback(
    async (postId: number) => {
      qc.setQueryData<InfiniteData<{ id: number; commentsShown: boolean }[]>>(queryKey, (oldData) => {
        if (!oldData) return oldData;

        // Flatten the old pages
        const newPosts = oldData?.pages.flat();

        // Find the index of the post
        const index = newPosts.findIndex((post) => post.id === postId);

        // Get the value of the old post
        const oldPost = newPosts[index];

        // Toggle the `commentsShown` boolean property of the target post
        newPosts[index] = {
          ...oldPost,
          commentsShown: !oldPost.commentsShown,
        };

        return {
          pages: chunk(newPosts, POSTS_PER_PAGE),
          pageParams: oldData.pageParams,
        };
      });
    },
    [qc, queryKey],
  );

  const renderPost = useCallback(
    (post: PostIds[number]) => (
      <Post key={post.id} id={post.id} commentsShown={post.commentsShown} toggleComments={toggleComments} />
    ),
    [toggleComments],
  );

  // Sort items to ensure newer posts (higher IDs) are at the top
  const sortPosts = useCallback(
    (items: PostIds) =>
      // Sort by ID in descending order (higher IDs = newer posts = top)
      [...items].sort((a, b) => b.id - a.id),
    [],
  );

  return (
    <BidirectionalScroll<PostIds[number]>
      queryResult={queryResult}
      renderItem={renderPost}
      estimateSize={400}
      itemSpacing={16}
      sortItems={sortPosts}
      loadingFallback={<PostSkeletonList count={3} />}
    />
  );
}
