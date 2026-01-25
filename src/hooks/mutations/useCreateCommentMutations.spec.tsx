import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useCreateCommentMutations } from './useCreateCommentMutations';

const showToastMock = vi.fn();
const mockNotifyError = vi.fn();
vi.mock('../useToast', () => ({ useToast: () => ({ showToast: showToastMock }) }));
vi.mock('../useErrorNotifier', () => ({ useErrorNotifier: () => ({ notifyError: mockNotifyError }) }));
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    if (key === 'hooks_mutations_comment_success') return 'Comentario publicado';
    if (key === 'hooks_mutations_reply_success') return 'Respuesta publicada';
    return key;
  },
}));
vi.mock('@tanstack/react-query', () => ({
  useMutation: (opts: {
    mutationFn: (vars: unknown) => Promise<unknown>;
    onSuccess?: (data: unknown) => void;
    onError?: (err: Error) => void;
  }) => ({
    mutate: (vars: unknown) =>
      opts
        .mutationFn(vars)
        .then((data) => opts.onSuccess?.(data))
        .catch((err) => opts.onError?.(err)),
    isPending: false,
  }),
  useQueryClient: () => ({ setQueryData: vi.fn() }),
}));

function TestHost() {
  const { createCommentMutation } = useCreateCommentMutations();
  return (
    <button type="button" onClick={() => createCommentMutation.mutate({ postId: 1, content: 'Hi' })}>
      Submit comment
    </button>
  );
}

function TestHostReply() {
  const { createReplyMutation } = useCreateCommentMutations();
  return (
    <button type="button" onClick={() => createReplyMutation.mutate({ parentId: 1, content: 'Hi' })}>
      Submit reply
    </button>
  );
}

describe('useCreateCommentMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows comment success toast with localized title', async () => {
    const createdComment = { id: 1, postId: 1 };
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(createdComment) })),
    );
    render(<TestHost />);
    screen.getByRole('button', { name: 'Submit comment' }).click();
    await vi.waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Comentario publicado', type: 'success' }),
      );
    });
  });

  it('shows reply success toast with localized title', async () => {
    const createdReply = { id: 2, parentId: 1 };
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url.includes('/replies')
          ? Promise.resolve({ ok: true, json: () => Promise.resolve(createdReply) })
          : Promise.reject(new Error('unexpected')),
      ),
    );
    render(<TestHostReply />);
    screen.getByRole('button', { name: 'Submit reply' }).click();
    await vi.waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Respuesta publicada', type: 'success' }),
      );
    });
  });
});
