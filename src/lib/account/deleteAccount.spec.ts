/* eslint-disable import/first, @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    visualMedia: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/s3/deleteObject', () => ({
  deleteObject: vi.fn().mockResolvedValue(undefined),
}));

import prisma from '@/lib/prisma/prisma';
import { deleteObject } from '@/lib/s3/deleteObject';
import { deleteAccount } from './deleteAccount';

describe('deleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is idempotent when user does not exist', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const res = await deleteAccount('u1');
    expect(res).toEqual({ deletedUserId: null, deletedFileNames: [] });
    expect(prisma.user.delete).not.toHaveBeenCalled();
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it('deletes S3 media and user via prisma with cascade', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ profilePhoto: 'pp.jpg', coverPhoto: 'cp.jpg' });
    (prisma.visualMedia.findMany as any).mockResolvedValue([{ fileName: 'm1.jpg' }, { fileName: 'm2.jpg' }]);
    (prisma.user.delete as any).mockResolvedValue({ id: 'u1' });

    const res = await deleteAccount('u1');
    expect(deleteObject).toHaveBeenCalledTimes(4);
    expect((deleteObject as any).mock.calls.flat()).toContain('pp.jpg');
    expect((deleteObject as any).mock.calls.flat()).toContain('cp.jpg');
    expect((deleteObject as any).mock.calls.flat()).toContain('m1.jpg');
    expect((deleteObject as any).mock.calls.flat()).toContain('m2.jpg');
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(res.deletedUserId).toBe('u1');
    expect(res.deletedFileNames.length).toBe(4);
  });
});
