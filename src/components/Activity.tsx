'use client';

import { GetActivity } from '@/types/definitions';
import { SemiBold } from '@/components/ui/SemiBold';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotificationsReadStatusMutations } from '@/hooks/mutations/useNotificationsReadStatusMutations';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import { ActivityCard } from './ActivityCard';

const SHARED_FORMATS = {
  sb: (chunks: ReactNode) => <SemiBold>{chunks}</SemiBold>,
};

/** Use this component to render individual activities or notifications. */
export function Activity({
  id,
  type,
  sourceId,
  sourceUser,
  targetId,
  targetUser,
  createdAt,
  isNotificationRead,
  content,
}: GetActivity) {
  const t = useTranslations();
  const { data: session } = useSession();
  const userId = session?.user.id;
  const router = useRouter();
  const { markAsReadMutation } = useNotificationsReadStatusMutations();

  // If this is an activity, the `sourceUser.id` is guaranteed to equal the `userId`.
  const isActivity = sourceUser.id === userId;
  const isNotification = targetUser.id === userId;
  const userToDisplay = isActivity ? targetUser : sourceUser;

  let actionKey = 'activity_unknown_action';
  if (type === 'CREATE_FOLLOW') {
    actionKey = 'activity_create_follow';
  } else if (type === 'POST_LIKE') {
    actionKey = 'activity_post_like';
  } else if (type === 'POST_MENTION') {
    actionKey = 'activity_post_mention';
  } else if (type === 'CREATE_COMMENT') {
    actionKey = 'activity_create_comment';
  } else if (type === 'COMMENT_LIKE') {
    actionKey = 'activity_comment_like';
  } else if (type === 'COMMENT_MENTION') {
    actionKey = 'activity_comment_mention';
  } else if (type === 'CREATE_REPLY') {
    actionKey = 'activity_create_reply';
  } else if (type === 'REPLY_LIKE') {
    actionKey = 'activity_reply_like';
  } else if (type === 'REPLY_MENTION') {
    actionKey = 'activity_reply_mention';
  }

  const actionText = t.rich(actionKey, {
    isSourceSelf: isActivity ? 'true' : 'false',
    sourceName: sourceUser.name,
    isTargetSelf: isNotification ? 'true' : 'false',
    targetName: targetUser.name,
    // If gender-specific pronouns like 'his' or 'her' are needed in other languages:
    sourceGender: sourceUser.gender?.toLowerCase() ?? '',
    ...SHARED_FORMATS,
  });

  const isRead = isActivity || isNotificationRead;
  const navigate = (href: string) => () => {
    router.push(href);

    // Set the notification as read
    if (!isNotification) return;
    markAsReadMutation.mutate({ notificationId: id });
  };

  if (type === 'CREATE_FOLLOW') {
    return (
      <ActivityCard
        type={type}
        user={userToDisplay}
        date={new Date(createdAt)}
        isRead={isRead}
        onClick={navigate(`/${isActivity ? targetUser.username : sourceUser.username}`)}>
        {actionText}
      </ActivityCard>
    );
  }

  if (type === 'POST_LIKE') {
    return (
      <ActivityCard
        type={type}
        user={userToDisplay}
        date={new Date(createdAt)}
        isRead={isRead}
        onClick={navigate(`/posts/${targetId}`)}>
        {actionText}: &quot;{content}
        &quot;
      </ActivityCard>
    );
  }
  if (type === 'POST_MENTION') {
    return (
      <ActivityCard
        type={type}
        user={userToDisplay}
        date={new Date(createdAt)}
        isRead={isRead}
        onClick={navigate(`/posts/${sourceId}`)}>
        {actionText}: &quot;{content}
        &quot;
      </ActivityCard>
    );
  }

  if (type === 'CREATE_COMMENT') {
    return (
      <ActivityCard
        type={type}
        user={userToDisplay}
        date={new Date(createdAt)}
        isRead={isRead}
        onClick={navigate(`/comments/${sourceId}`)}>
        {actionText}: &quot;
        {content}&quot;
      </ActivityCard>
    );
  }
  if (type === 'COMMENT_LIKE') {
    return (
      <ActivityCard
        type={type}
        user={userToDisplay}
        date={new Date(createdAt)}
        isRead={isRead}
        onClick={navigate(`/comments/${targetId}`)}>
        {actionText}: &quot;{content}
        &quot;
      </ActivityCard>
    );
  }
  if (type === 'COMMENT_MENTION') {
    return (
      <ActivityCard
        type={type}
        user={userToDisplay}
        date={new Date(createdAt)}
        isRead={isRead}
        onClick={navigate(`/comments/${sourceId}`)}>
        {actionText}: &quot;{content}
        &quot;
      </ActivityCard>
    );
  }

  if (type === 'CREATE_REPLY') {
    return (
      <ActivityCard
        type={type}
        user={userToDisplay}
        date={new Date(createdAt)}
        isRead={isRead}
        onClick={navigate(`/comments/${sourceId}`)}>
        {actionText}: &quot;{content}
        &quot;
      </ActivityCard>
    );
  }
  if (type === 'REPLY_LIKE') {
    return (
      <ActivityCard
        type={type}
        user={userToDisplay}
        date={new Date(createdAt)}
        isRead={isRead}
        onClick={navigate(`/comments/${targetId}`)}>
        {actionText}: &quot;{content}
        &quot;
      </ActivityCard>
    );
  }
  if (type === 'REPLY_MENTION') {
    return (
      <ActivityCard
        type={type}
        user={userToDisplay}
        date={new Date(createdAt)}
        isRead={isRead}
        onClick={navigate(`/comments/${sourceId}`)}>
        {actionText}: &quot;{content}&quot;
      </ActivityCard>
    );
  }

  return null;
}
