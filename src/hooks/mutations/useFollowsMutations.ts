'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GetUser } from '@/types/definitions';
import { useSession } from 'next-auth/react';
import { useToast } from '../useToast';
import { useTranslations } from 'next-intl';
import posthog from 'posthog-js';

async function follow({ userId, targetUserId }: { userId: string; targetUserId: string }, t: (key: string) => string) {
  const res = await fetch(`/api/users/${userId}/following`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userIdToFollow: targetUserId }),
  });

  if (!res.ok) {
    if (res.status === 409) return;
    throw new Error(t('failed_to_follow_user'));
  }
}

async function unFollow(
  { userId, targetUserId }: { userId: string; targetUserId: string },
  t: (key: string) => string,
) {
  const res = await fetch(`/api/users/${userId}/following/${targetUserId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    if (res.status === 409) return;
    throw new Error(t('failed_to_unfollow_user'));
  }
}

export function useFollowsMutations({ targetUserId }: { targetUserId: string }) {
  const t = useTranslations();
  const qc = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user.id;
  const queryKey = ['users', targetUserId];
  const { showToast } = useToast();

  const followMutation = useMutation({
    mutationFn: () => {
      if (currentUserId) {
        return follow({ userId: currentUserId, targetUserId }, t);
      }
      return Promise.reject(new Error(t('user_not_authenticated')));
    },
    onMutate: async () => {
      // Cancel outgoing queries and snapshot the prev value
      await qc.cancelQueries({ queryKey });
      const previousTargetUser = qc.getQueryData(queryKey);

      // Optimistically update the UI
      qc.setQueryData<GetUser>(queryKey, (oldTargetUser) => {
        if (!oldTargetUser) return oldTargetUser;
        return {
          ...oldTargetUser,
          isFollowing: true,
          followerCount: (oldTargetUser.followerCount || 0) + 1,
        };
      });

      // Track user follow event
      posthog.capture('user_followed', {
        target_user_id: targetUserId,
      });

      // Return a context object with the snapshotted value
      return { previousTargetUser };
    },
    onError: (err: Error, variables, context) => {
      qc.setQueryData(queryKey, context?.previousTargetUser);
      showToast({
        title: t('something_went_wrong'),
        message: err.message,
        type: 'error',
      });
    },
  });

  const unFollowMutation = useMutation({
    mutationFn: () => {
      if (currentUserId) {
        return unFollow({ userId: currentUserId, targetUserId }, t);
      }
      return Promise.reject(new Error(t('user_not_authenticated')));
    },
    onMutate: async () => {
      // Cancel outgoing queries and snapshot the prev value
      await qc.cancelQueries({ queryKey });
      const previousTargetUser = qc.getQueryData(queryKey);

      // Optimistically update the UI
      qc.setQueryData<GetUser>(queryKey, (oldTargetUser) => {
        if (!oldTargetUser) return oldTargetUser;
        return {
          ...oldTargetUser,
          isFollowing: false,
          followerCount: (oldTargetUser.followerCount || 0) - 1,
        };
      });

      // Track user unfollow event
      posthog.capture('user_unfollowed', {
        target_user_id: targetUserId,
      });

      // Return a context object with the snapshotted value
      return { previousTargetUser };
    },
    onError: (err: Error, variables, context) => {
      qc.setQueryData(queryKey, context?.previousTargetUser);
      showToast({
        title: t('something_went_wrong'),
        message: err.message,
        type: 'error',
      });
    },
  });

  return { followMutation, unFollowMutation };
}
