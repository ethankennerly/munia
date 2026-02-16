import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import { uploadObject } from '@/lib/s3/uploadObject';
import prisma from '@/lib/prisma/prisma';
import { logger } from '@/lib/logging';
import { importProfilePic } from './importProfilePic';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/s3/uploadObject', () => ({ uploadObject: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/prisma/prisma', () => ({
  default: {
    user: { update: vi.fn().mockResolvedValue({ id: 'u1' }) },
    post: { create: vi.fn().mockResolvedValue({ id: 1 }) },
  },
}));
vi.mock('@/lib/logging', () => ({ logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));

/** Create a minimal JPEG buffer (3 magic bytes). */
function fakeJpeg() {
  const arr = new ArrayBuffer(3);
  const view = new Uint8Array(arr);
  view[0] = 0xff;
  view[1] = 0xd8;
  view[2] = 0xff;
  return arr;
}

function stubFetch(arrayBuffer: ArrayBuffer, contentType = 'image/jpeg') {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => arrayBuffer,
      headers: {
        get: (k: string) => (k === 'content-type' ? contentType : String(new Uint8Array(arrayBuffer).length)),
      },
    } as unknown as Response),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('importProfilePic – Google', () => {
  it('imports image for a valid Google URL', async () => {
    stubFetch(fakeJpeg());

    const res = await importProfilePic({
      pictureUrl: 'https://lh3.googleusercontent.com/example.jpg',
      userId: 'u1',
      provider: 'google',
    });

    expect(res).not.toBeNull();
    expect(uploadObject).toHaveBeenCalled();
    expect(prisma.user.update as unknown as Mock).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ msg: 'import_profile_metric', provider: 'google', event: 'success' }),
    );
  });

  it('returns null for disallowed host', async () => {
    const res = await importProfilePic({ pictureUrl: 'https://example.com/foo.jpg', userId: 'u1', provider: 'google' });
    expect(res).toBeNull();
    expect(uploadObject).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ msg: 'import_profile_metric', event: 'failure', reason: 'disallowed_host' }),
    );
  });

  it('returns null for non-https', async () => {
    const res = await importProfilePic({
      pictureUrl: 'http://lh3.googleusercontent.com/foo.jpg',
      userId: 'u1',
      provider: 'google',
    });
    expect(res).toBeNull();
    expect(uploadObject).not.toHaveBeenCalled();
  });
});

describe('importProfilePic – GitHub', () => {
  it('imports image for a valid GitHub URL', async () => {
    stubFetch(fakeJpeg());

    const res = await importProfilePic({
      pictureUrl: 'https://avatars.githubusercontent.com/u/12345?v=4',
      userId: 'u2',
      provider: 'github',
    });

    expect(res).not.toBeNull();
    expect(uploadObject).toHaveBeenCalled();
    expect(prisma.user.update as unknown as Mock).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ msg: 'import_profile_metric', provider: 'github', event: 'success' }),
    );
  });

  it('rejects non-GitHub host for github provider', async () => {
    const res = await importProfilePic({
      pictureUrl: 'https://lh3.googleusercontent.com/foo.jpg',
      userId: 'u2',
      provider: 'github',
    });
    expect(res).toBeNull();
    expect(uploadObject).not.toHaveBeenCalled();
  });
});

describe('importProfilePic – Facebook', () => {
  it('imports image for a valid Facebook URL', async () => {
    stubFetch(fakeJpeg());

    const res = await importProfilePic({
      pictureUrl: 'https://platform-lookaside.fbsbx.com/photo.jpg',
      userId: 'u3',
      provider: 'facebook',
    });

    expect(res).not.toBeNull();
    expect(uploadObject).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ msg: 'import_profile_metric', provider: 'facebook', event: 'success' }),
    );
  });

  it('rejects non-Facebook host for facebook provider', async () => {
    const res = await importProfilePic({
      pictureUrl: 'https://avatars.githubusercontent.com/u/123',
      userId: 'u3',
      provider: 'facebook',
    });
    expect(res).toBeNull();
  });
});

describe('importProfilePic – Mock OAuth', () => {
  it('imports image from i.pravatar.cc', async () => {
    stubFetch(fakeJpeg());

    const res = await importProfilePic({
      pictureUrl: 'https://i.pravatar.cc/200?u=testuser',
      userId: 'u4',
      provider: 'mock-oauth',
    });

    expect(res).not.toBeNull();
    expect(uploadObject).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ msg: 'import_profile_metric', provider: 'mock-oauth', event: 'success' }),
    );
  });

  it('rejects non-pravatar host for mock-oauth provider', async () => {
    const res = await importProfilePic({
      pictureUrl: 'https://example.com/photo.jpg',
      userId: 'u4',
      provider: 'mock-oauth',
    });
    expect(res).toBeNull();
  });
});

describe('importProfilePic – unknown provider', () => {
  it('rejects any URL for an unknown provider', async () => {
    const res = await importProfilePic({
      pictureUrl: 'https://lh3.googleusercontent.com/foo.jpg',
      userId: 'u5',
      provider: 'unknown',
    });
    expect(res).toBeNull();
  });
});
