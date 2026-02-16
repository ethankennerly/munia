import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@/lib/auth/importProfilePic', () => ({ importProfilePic: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/logging', () => ({ logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));
vi.mock('@/lib/prisma/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import prisma from '@/lib/prisma/prisma';
import { importProfilePic } from '@/lib/auth/importProfilePic';
import { handleMockOAuthUser } from './handleMockOAuthUser';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleMockOAuthUser', () => {
  it('creates user and imports profile pic for new user', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue(null);
    (prisma.user.create as unknown as Mock).mockResolvedValue({
      id: 'mock:daniel@example.com',
      email: 'daniel@example.com',
      name: 'Daniel',
      profilePhoto: null,
    });

    const result = await handleMockOAuthUser({ email: 'daniel@example.com', name: 'Daniel' });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'mock:daniel@example.com',
          email: 'daniel@example.com',
          name: 'Daniel',
        }),
      }),
    );

    expect(importProfilePic).toHaveBeenCalledWith({
      pictureUrl: 'https://i.pravatar.cc/200?u=daniel%40example.com',
      userId: 'mock:daniel@example.com',
      provider: 'mock-oauth',
    });

    expect(result).toEqual({
      id: 'mock:daniel@example.com',
      name: 'Daniel',
      email: 'daniel@example.com',
      image: 'https://i.pravatar.cc/200?u=daniel%40example.com',
    });
  });

  it('does not create user if existing, does not import if has profilePhoto', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue({
      id: 'mock:existing@example.com',
      email: 'existing@example.com',
      name: 'Existing',
      profilePhoto: 'existing-photo.jpg',
    });

    const result = await handleMockOAuthUser({ email: 'existing@example.com', name: 'Existing' });

    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(importProfilePic).not.toHaveBeenCalled();

    expect(result).toEqual({
      id: 'mock:existing@example.com',
      name: 'Existing',
      email: 'existing@example.com',
      image: 'https://i.pravatar.cc/200?u=existing%40example.com',
    });
  });

  it('imports profile pic for existing user without profilePhoto', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue({
      id: 'mock:nopic@example.com',
      email: 'nopic@example.com',
      name: 'NoPic',
      profilePhoto: null,
    });

    await handleMockOAuthUser({ email: 'nopic@example.com', name: 'NoPic' });

    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(importProfilePic).toHaveBeenCalledWith({
      pictureUrl: 'https://i.pravatar.cc/200?u=nopic%40example.com',
      userId: 'mock:nopic@example.com',
      provider: 'mock-oauth',
    });
  });

  it('continues if import fails', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue(null);
    (prisma.user.create as unknown as Mock).mockResolvedValue({
      id: 'mock:fail@example.com',
      email: 'fail@example.com',
      name: 'Fail',
      profilePhoto: null,
    });
    (importProfilePic as unknown as Mock).mockRejectedValue(new Error('network error'));

    const result = await handleMockOAuthUser({ email: 'fail@example.com', name: 'Fail' });

    // Should still return the user even if import fails
    expect(result).toEqual({
      id: 'mock:fail@example.com',
      name: 'Fail',
      email: 'fail@example.com',
      image: 'https://i.pravatar.cc/200?u=fail%40example.com',
    });
  });
});
