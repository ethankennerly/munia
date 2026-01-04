'use client';

import Button from '@/components/ui/Button';
import { useFollowsMutations } from '@/hooks/mutations/useFollowsMutations';
import { useUserQuery } from '@/hooks/queries/useUserQuery';
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

export function ProfileActionButtons({ targetUserId }: { targetUserId: string }) {
  const t = useTranslations();
  const { data: targetUser, isPending } = useUserQuery(targetUserId);
  const isFollowing = targetUser?.isFollowing;
  const { followMutation, unFollowMutation } = useFollowsMutations({
    targetUserId,
  });

  const handleClick = useCallback(() => {
    if (isFollowing) {
      unFollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  }, [isFollowing, followMutation, unFollowMutation]);

  return (
    <div className="flex flex-row items-center gap-2 md:gap-4">
      <Button
        onPress={handleClick}
        mode={isFollowing ? 'secondary' : 'primary'}
        shape="pill"
        loading={isPending}
        data-activate-id={isFollowing ? 'unfollow-user' : 'follow-user'}>
        {isFollowing ? t('components_unfollow') : t('components_follow')}
      </Button>
      {/* <Button Icon={Mail} onPress={() => {}} mode="secondary" size="medium" /> */}
    </div>
  );
}
