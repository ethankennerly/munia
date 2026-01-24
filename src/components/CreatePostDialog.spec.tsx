import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreatePostDialog } from './CreatePostDialog';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/hooks/mutations/useWritePostMutations', () => ({
  useWritePostMutations: () => ({
    createPostMutation: { mutate: vi.fn(), isPending: false },
    updatePostMutation: { mutate: vi.fn(), isPending: false },
  }),
}));

vi.mock('@/hooks/useDialogs', () => ({
  useDialogs: () => ({ confirm: vi.fn() }),
}));

vi.mock('@/components/GenericDialog', () => ({
  GenericDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/TextAreaWithMentionsAndHashTags', () => ({
  TextAreaWithMentionsAndHashTags: ({ content }: { content: string }) => (
    <textarea data-testid="textarea" value={content} readOnly />
  ),
}));

vi.mock('@/components/ui/ProfilePhotoOwn', () => ({
  ProfilePhotoOwn: () => <div data-testid="profile-photo" />,
}));

vi.mock('@/components/CreatePostOptions', () => {
  const MockComponent = React.forwardRef(() => <div data-testid="create-post-options" />);
  MockComponent.displayName = 'CreatePostOptions';
  return { CreatePostOptions: MockComponent };
});

vi.mock('@/components/CreatePostSort', () => ({
  CreatePostSort: () => null,
}));

describe('CreatePostDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('constrains textarea container height to prevent button from going off-screen', () => {
    const longContent = Array(100).fill('line of text\n').join('');
    const { container } = render(
      <CreatePostDialog
        toEditValues={{ initialContent: longContent, initialVisualMedia: [], postId: 'test' }}
        shouldOpenFileInputOnMount={false}
        setShown={vi.fn()}
      />,
    );
    const textareaContainer = container.querySelector('.flex.flex-1.flex-col');
    expect(textareaContainer).toHaveClass('max-h-[60vh]');
    expect(textareaContainer).toHaveClass('overflow-y-auto');
  });
});
