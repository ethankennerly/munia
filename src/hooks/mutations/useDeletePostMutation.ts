'use client';

import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { chunk } from 'lodash';
import { POSTS_PER_PAGE } from '@/constants';
import { useSession } from 'next-auth/react';
import { PostIds } from '@/types/definitions';
import { useErrorNotifier } from '../useErrorNotifier';
import { rebuildAfterRemoval } from '@/lib/pagination/infiniteUtils';

export function useDeletePostMutation() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const queryKey = ['users', session?.user.id, 'posts'];
  const { notifyError } = useErrorNotifier();

  const deleteMutation = useMutation({
    mutationFn: async ({ postId }: { postId: number }) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true, recentAuthTimestamp: Date.now() }),
      });

      if (!res.ok) {
        throw Error('Failed to delete post.');
      }

      return (await res.json()) as { id: number };
    },
    onMutate: async ({ postId }) => {
      // Cancel any outgoing refetches
      await qc.cancelQueries({ queryKey });

      // Snapshot the previous posts
      const previousPosts = qc.getQueryData(queryKey);

      // Optimistically remove the post
      qc.setQueriesData<InfiniteData<PostIds>>({ queryKey }, (oldData) => {
        if (!oldData) return oldData;
        const rebuilt = rebuildAfterRemoval(oldData as any, postId, POSTS_PER_PAGE);
        return rebuilt as any;
      });

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
    onError: (error, variables, context) => {
      qc.setQueryData(queryKey, context?.previousPosts);
      notifyError(error);
    },
  });

  return { deleteMutation };
}
