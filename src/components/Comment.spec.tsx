import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Comment } from './Comment';

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 1 } } }),
}));

vi.mock('@/hooks/mutations/useCreateCommentMutations', () => ({
  useCreateCommentMutations: () => ({
    createReplyMutation: { mutate: vi.fn(), isPending: false },
  }),
}));

vi.mock('@/hooks/useUpdateDeleteComments', () => ({
  useUpdateDeleteComments: () => ({
    handleEdit: vi.fn(),
    handleDelete: vi.fn(),
  }),
}));

vi.mock('@/hooks/useLikeUnlikeComments', () => ({
  useLikeUnlikeComments: () => ({
    likeComment: vi.fn(),
    unLikeComment: vi.fn(),
  }),
}));

vi.mock('@/hooks/useDialogs', () => ({
  useDialogs: () => ({ prompt: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe('Comment', () => {
  it('wraps long unbroken words by having min-w-0 flex-1 on container', () => {
    const longWord = 'a'.repeat(200);
    const { container } = render(
      <Comment
        id={1}
        content={longWord}
        createdAt={new Date()}
        user={{ id: 1, name: 'Test', username: 'test', profilePhoto: null }}
        isOwnComment={false}
        isLiked={false}
        _count={{ commentLikes: 0, comments: 0, replies: 0 }}
        repliesShown={false}
        setRepliesVisibility={() => {}}
        queryKey={['test']}
      />,
    );
    const containerDiv = container.querySelector('.min-w-0.flex-1');
    expect(containerDiv).toBeInTheDocument();
  });
});
