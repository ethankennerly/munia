'use client';

import { Item, Section } from 'react-stately';
import { useDialogs } from '@/hooks/useDialogs';
import { GetVisualMedia } from '@/types/definitions';
import { Key, useCallback } from 'react';
import { useCreatePostModal } from '@/hooks/useCreatePostModal';
import { useDeletePostMutation } from '@/hooks/mutations/useDeletePostMutation';
import { useTranslations } from 'next-intl';
import { DropdownMenuButton } from './ui/DropdownMenuButton';

export function PostOptions({
  postId,
  content,
  visualMedia,
}: {
  postId: number;
  content: string | null;
  visualMedia?: GetVisualMedia[];
}) {
  const t = useTranslations();
  const { confirm } = useDialogs();
  const { launchEditPost } = useCreatePostModal();
  const { deleteMutation } = useDeletePostMutation();

  const handleDeleteClick = useCallback(() => {
    confirm({
      title: t('components_postoptions'),
      message: t('components_postoptions_you_really_wish'),
      onConfirm: () => {
        // Wait for the dialog to close before deleting the comment to pass the focus to
        // the next element first, preventing the focus from resetting to the top
        setTimeout(() => deleteMutation.mutate({ postId }), 300);
      },
    });
  }, [confirm, deleteMutation, postId, t]);

  const handleEditClick = useCallback(() => {
    launchEditPost({
      postId,
      initialContent: content ?? '',
      initialVisualMedia: visualMedia ?? [],
    });
  }, [launchEditPost, postId, content, visualMedia]);

  const handleOptionClick = useCallback(
    (key: Key) => {
      if (key === 'edit') {
        handleEditClick();
      } else {
        handleDeleteClick();
      }
    },
    [handleEditClick, handleDeleteClick],
  );

  return (
    <DropdownMenuButton
      key={`posts-${postId}-options`}
      label={t('components_postoptions_post_options')}
      onAction={handleOptionClick}>
      <Section>
        <Item key="edit">{t('components_postoptions_edit_post')}</Item>
        <Item key="delete">{t('components_postoptions')}</Item>
      </Section>
    </DropdownMenuButton>
  );
}
