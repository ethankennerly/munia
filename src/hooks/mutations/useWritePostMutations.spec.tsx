import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useWritePostMutations } from './useWritePostMutations';

const mockNotifyError = vi.fn();
const showToastMock = vi.fn();
vi.mock('../useToast', () => ({ useToast: () => ({ showToast: showToastMock }) }));
vi.mock('../useErrorNotifier', () => ({ useErrorNotifier: () => ({ notifyError: mockNotifyError }) }));
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => (key === 'hooks_mutations_post_success' ? 'Publicado correctamente' : key),
}));
vi.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: '1' } } }) }));
vi.mock('@tanstack/react-query', () => ({
  useMutation: (opts: {
    mutationFn: () => Promise<unknown>;
    onSuccess?: (data: unknown) => void;
    onError?: (err: Error) => void;
  }) => ({
    mutate: () =>
      opts
        .mutationFn()
        .then((data) => opts.onSuccess?.(data))
        .catch((err) => opts.onError?.(err)),
    isPending: false,
  }),
  useQueryClient: () => ({ setQueryData: vi.fn(), setQueriesData: vi.fn() }),
  InfiniteData: {},
}));

function TestHost({
  clearVisualMedia,
  visualMedia = [],
}: {
  clearVisualMedia?: () => void;
  visualMedia?: { type: string; url: string }[];
}) {
  const { createPostMutation } = useWritePostMutations({
    content: '',
    visualMedia,
    exitCreatePostModal: vi.fn(),
    clearVisualMedia,
  });
  return (
    <button type="button" onClick={() => createPostMutation.mutate()}>
      Post
    </button>
  );
}

describe('useWritePostMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows API error body message when create post fails (e.g. file too large)', async () => {
    const serverMessage = 'Image is too large. Maximum dimensions 4096×4096.';
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Payload Too Large',
          json: () => Promise.resolve({ error: serverMessage }),
        }),
      ),
    );
    render(<TestHost />);
    screen.getByRole('button', { name: 'Post' }).click();
    await vi.waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalled();
    });
    const err = mockNotifyError.mock.calls[0][0];
    expect(err instanceof Error).toBe(true);
    expect((err as Error).message).toBe(serverMessage);
  });

  it('shows post success toast with localized title', async () => {
    const createdPost = { id: 1 };
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(createdPost) })),
    );
    render(<TestHost />);
    screen.getByRole('button', { name: 'Post' }).click();
    await vi.waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith({ title: 'Publicado correctamente', type: 'success' });
    });
  });

  it('calls clearVisualMedia when create post fails so dialog can remove image and stay open', async () => {
    const clearVisualMedia = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        typeof url === 'string' && url.startsWith('blob:')
          ? Promise.resolve({ blob: () => new Blob() })
          : Promise.resolve({
              ok: false,
              json: () => Promise.resolve({ error: 'Image is too large. Maximum dimensions 4096×4096.' }),
            }),
      ),
    );
    render(<TestHost clearVisualMedia={clearVisualMedia} visualMedia={[{ type: 'PHOTO', url: 'blob:fake' }]} />);
    screen.getByRole('button', { name: 'Post' }).click();
    await vi.waitFor(() => {
      expect(clearVisualMedia).toHaveBeenCalled();
    });
  });
});
