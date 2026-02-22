import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { GetComment } from '@/types/definitions';
import { useErrorNotifier } from '../useErrorNotifier';
import { useToast } from '../useToast';

export function useCreateCommentMutations() {
  const qc = useQueryClient();
  const t = useTranslations();
  const { showToast } = useToast();
  const { notifyError } = useErrorNotifier();

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
        }),
      });

      if (!res.ok) throw new Error(res.statusText);
      return (await res.json()) as GetComment;
    },
    onSuccess: (createdComment) => {
      qc.setQueryData<GetComment[]>(['posts', createdComment.postId, 'comments'], (oldComments) => {
        if (!oldComments) return oldComments;
        return [...oldComments, createdComment];
      });

      showToast({
        title: t('hooks_mutations_comment_success'),
        message: t('your_comment_has_been_created'),
        type: 'success',
      });
    },
    onError: (err) => {
      notifyError(err);
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: number; content: string }) => {
      const res = await fetch(`/api/comments/${parentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
        }),
      });

      if (!res.ok) throw new Error(res.statusText);
      return (await res.json()) as GetComment;
    },
    onSuccess: (createdReply) => {
      qc.setQueryData<GetComment[]>(['comments', createdReply.parentId, 'replies'], (oldReplies) => {
        if (!oldReplies) return oldReplies;
        return [...oldReplies, createdReply];
      });
      showToast({
        title: t('hooks_mutations_reply_success'),
        message: t('your_reply_has_been_created'),
        type: 'success',
      });
    },
    onError: (err) => {
      notifyError(err);
    },
  });

  return {
    createCommentMutation,
    createReplyMutation,
  };
}
