import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
  const MockComponent = React.forwardRef<
    HTMLInputElement,
    { handleVisualMediaChange: React.ChangeEventHandler<HTMLInputElement> }
  >((props, ref) => (
    <input
      ref={ref}
      type="file"
      data-testid="create-post-file-input"
      onChange={props.handleVisualMediaChange}
      accept="video/*,.jpg,.jpeg,.png"
    />
  ));
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

  it('attaches image when dialog opened via Image/Video and user selects a file', () => {
    vi.stubGlobal('URL', {
      ...globalThis.URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
    });
    render(<CreatePostDialog toEditValues={null} shouldOpenFileInputOnMount={true} setShown={vi.fn()} />);
    const fileInput = screen.getByTestId('create-post-file-input');
    const file = new File([''], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    const postButton = screen.getByRole('button', { name: 'post' });
    expect(postButton).not.toBeDisabled();
  });

  it('attaches image when dialog opens with initial files from launcher', () => {
    vi.stubGlobal('URL', {
      ...globalThis.URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
    });
    const file = new File([''], 'test.png', { type: 'image/png' });
    render(
      <CreatePostDialog
        toEditValues={null}
        shouldOpenFileInputOnMount={false}
        setShown={vi.fn()}
        initialFiles={[file]}
      />,
    );
    const postButton = screen.getByRole('button', { name: 'post' });
    expect(postButton).not.toBeDisabled();
  });
});
