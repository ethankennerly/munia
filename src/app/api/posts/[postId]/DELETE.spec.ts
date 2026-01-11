/* eslint-disable prettier/prettier */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks
vi.mock('@/lib/prisma/prisma', () => ({
  default: {
    post: {
      delete: vi.fn(),
    },
    visualMedia: {
      findMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/s3/deleteObject', () => ({
  deleteObject: vi.fn(async () => {}),
}));

// We'll mock verifyAccessToPost per test case
vi.mock('./verifyAccessToPost', () => ({
  verifyAccessToPost: vi.fn(),
}));

import prisma from '@/lib/prisma/prisma';
import { deleteObject } from '@/lib/s3/deleteObject';
import { verifyAccessToPost } from './verifyAccessToPost';
import { DELETE } from './DELETE';

function makeRequest(method: string, body?: any) {
  return new Request('http://localhost/api/posts/123', {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('DELETE /api/posts/:postId', () => {
  const postId = '123';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new Request('http://localhost/api/posts/123', { method: 'DELETE', body: 'not-json' as any });
    const res = await DELETE(req as any, { params: { postId } } as any);
    expect((res as Response).status).toBe(400);
  });

  it('returns 400 when confirmation is missing', async () => {
    const req = makeRequest('DELETE', { recentAuthTimestamp: Date.now() });
    const res = await DELETE(req as any, { params: { postId } } as any);
    expect((res as Response).status).toBe(400);
  });

  it('returns 401 when recent-auth is stale or invalid', async () => {
    // stale by setting timestamp far in the past
    const req = makeRequest('DELETE', { confirm: true, recentAuthTimestamp: Date.now() - 10 * 60 * 1000 });
    const res = await DELETE(req as any, { params: { postId } } as any);
    expect((res as Response).status).toBe(401);
  });

  it('returns 403 when user is not the owner', async () => {
    (verifyAccessToPost as any).mockResolvedValue(false);
    const req = makeRequest('DELETE', { confirm: true, recentAuthTimestamp: Date.now() });
    const res = await DELETE(req as any, { params: { postId } } as any);
    expect((res as Response).status).toBe(403);
  });

  it('returns 200 and deletes media + post on success', async () => {
    (verifyAccessToPost as any).mockResolvedValue(true);
    // First, route will read current post's media
    (prisma.visualMedia.findMany as any).mockResolvedValueOnce([
      { fileName: 'a.jpg' },
      { fileName: 'b.png' },
    ]);
    // Then it will check other posts referencing the same files
    (prisma.visualMedia.findMany as any).mockResolvedValueOnce([]);
    // And it will check users' profile/cover references
    (prisma.user.findMany as any).mockResolvedValueOnce([]);
    (prisma.post.delete as any).mockResolvedValue({ id: 123 });

    const req = makeRequest('DELETE', { confirm: true, recentAuthTimestamp: Date.now() });
    const res = (await DELETE(req as any, { params: { postId } } as any)) as Response;
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ id: 123 });
    expect(prisma.post.delete).toHaveBeenCalled();
    expect(deleteObject).toHaveBeenCalledTimes(2);
  });

  it('keeps media file if used by another post', async () => {
    (verifyAccessToPost as any).mockResolvedValue(true);
    // Current post media
    (prisma.visualMedia.findMany as any).mockResolvedValueOnce([
      { fileName: 'shared.jpg' },
      { fileName: 'unique.png' },
    ]);
    // Other posts reference: one file is referenced elsewhere
    (prisma.visualMedia.findMany as any).mockResolvedValueOnce([
      { fileName: 'shared.jpg' },
    ]);
    // No user profile/cover references
    (prisma.user.findMany as any).mockResolvedValueOnce([]);
    (prisma.post.delete as any).mockResolvedValue({ id: 123 });

    const req = makeRequest('DELETE', { confirm: true, recentAuthTimestamp: Date.now() });
    const res = (await DELETE(req as any, { params: { postId } } as any)) as Response;
    expect(res.status).toBe(200);
    // Only the unique file should be deleted from S3
    expect(deleteObject).toHaveBeenCalledTimes(1);
    expect((deleteObject as any).mock.calls[0][0]).toBe('unique.png');
  });

  it('keeps media file if used as profile or cover photo', async () => {
    (verifyAccessToPost as any).mockResolvedValue(true);
    // Current post media
    (prisma.visualMedia.findMany as any).mockResolvedValueOnce([
      { fileName: 'avatar.jpg' },
    ]);
    // No other post references
    (prisma.visualMedia.findMany as any).mockResolvedValueOnce([]);
    // Referenced by a user's profile photo
    (prisma.user.findMany as any).mockResolvedValueOnce([
      { profilePhoto: 'avatar.jpg', coverPhoto: null },
    ]);
    (prisma.post.delete as any).mockResolvedValue({ id: 123 });

    const req = makeRequest('DELETE', { confirm: true, recentAuthTimestamp: Date.now() });
    const res = (await DELETE(req as any, { params: { postId } } as any)) as Response;
    expect(res.status).toBe(200);
    // No S3 deletion should be attempted
    expect(deleteObject).not.toHaveBeenCalled();
  });
});