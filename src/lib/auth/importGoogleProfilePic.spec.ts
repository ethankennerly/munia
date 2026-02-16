import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import { uploadObject } from '@/lib/s3/uploadObject';
import prisma from '@/lib/prisma/prisma';
import { logger } from '@/lib/logging';
import { importGoogleProfilePic } from './importGoogleProfilePic';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/s3/uploadObject', () => ({ uploadObject: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/prisma/prisma', () => ({
  default: {
    user: { update: vi.fn().mockResolvedValue({ id: 'u1' }) },
    post: { create: vi.fn().mockResolvedValue({ id: 1 }) },
  },
}));
vi.mock('@/lib/logging', () => ({ logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('importGoogleProfilePic', () => {
  it('imports image, processes and stores when valid google url', async () => {
    // Mock fetch
    const arr = new ArrayBuffer(3);
    const view = new Uint8Array(arr);
    view[0] = 0xff;
    view[1] = 0xd8;
    view[2] = 0xff;
    const fakeArrayBuffer = arr; // JPEG signature
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => fakeArrayBuffer,
        headers: {
          get: (k: string) => (k === 'content-type' ? 'image/jpeg' : String(new Uint8Array(fakeArrayBuffer).length)),
        },
      } as unknown as Response),
    );

    const res = await importGoogleProfilePic({
      pictureUrl: 'https://lh3.googleusercontent.com/example.jpg',
      userId: 'u1',
    });

    expect(res).not.toBeNull();
    expect(uploadObject).toHaveBeenCalled();
    expect(prisma.user.update as unknown as Mock).toHaveBeenCalled();
    // Per spec, we should NOT create a post for imported Google profile pictures
    const postCreateMock = prisma.post.create as unknown as Mock;
    expect(postCreateMock).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'import_profile_metric',
        event: 'success',
      }),
    );
  });

  it('returns null for disallowed host', async () => {
    const res = await importGoogleProfilePic({ pictureUrl: 'https://example.com/foo.jpg', userId: 'u1' });
    expect(res).toBeNull();
    expect(uploadObject).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ msg: 'import_profile_metric', event: 'failure', reason: 'disallowed_host' }),
    );
  });

  it('returns null for non-https', async () => {
    const res = await importGoogleProfilePic({ pictureUrl: 'http://lh3.googleusercontent.com/foo.jpg', userId: 'u1' });
    expect(res).toBeNull();
    expect(uploadObject).not.toHaveBeenCalled();
  });
});
