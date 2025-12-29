/* eslint-disable import/first, import/order */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@/lib/auth/importGoogleProfilePic', () => ({ importGoogleProfilePic: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/logging', () => ({ logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));
vi.mock('@/lib/prisma/prisma', () => ({ default: { user: { findUnique: vi.fn() } } }));

import prisma from '@/lib/prisma/prisma';
import { logger } from '@/lib/logging';
import { handleSignIn } from './handleSignIn';
import { importGoogleProfilePic } from './importGoogleProfilePic';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleSignIn', () => {
  it('skips when provider is not google', async () => {
    await handleSignIn({ user: { id: 'u1' }, account: { provider: 'github' }, profile: {} });
    expect(importGoogleProfilePic).not.toHaveBeenCalled();
    expect(logger.info as unknown as Mock).toHaveBeenCalledWith(expect.objectContaining({ msg: 'signIn_event' }));
  });

  it('skips when user already has profilePhoto', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue({ profilePhoto: 'pp.jpg' });
    await handleSignIn({ user: { id: 'u1' }, account: { provider: 'google' }, profile: {} });
    expect(importGoogleProfilePic).not.toHaveBeenCalled();
    expect(logger.info as unknown as Mock).toHaveBeenCalledWith(
      expect.objectContaining({ msg: 'signIn_has_profile_photo' }),
    );
  });

  it('imports when no profilePhoto and profile has picture', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue({ profilePhoto: null });
    await handleSignIn({
      user: { id: 'u1' },
      account: { provider: 'google' },
      profile: { picture: 'https://lh3.googleusercontent.com/foo.jpg' },
    });
    expect(importGoogleProfilePic).toHaveBeenCalledWith({
      pictureUrl: 'https://lh3.googleusercontent.com/foo.jpg',
      userId: 'u1',
    });
  });
});
