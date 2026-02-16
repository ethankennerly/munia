import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@/lib/auth/importProfilePic', () => ({ importProfilePic: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/logging', () => ({ logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));
vi.mock('@/lib/prisma/prisma', () => ({ default: { user: { findUnique: vi.fn() } } }));
vi.mock('@/lib/posthog-server', () => ({ getPostHogClient: () => ({ capture: vi.fn(), identify: vi.fn() }) }));

import prisma from '@/lib/prisma/prisma';
import { logger } from '@/lib/logging';
import { handleSignIn } from './handleSignIn';
import { importProfilePic } from './importProfilePic';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleSignIn', () => {
  it('skips when provider is unsupported', async () => {
    await handleSignIn({ user: { id: 'u1' }, account: { provider: 'email' }, profile: {} });
    expect(importProfilePic).not.toHaveBeenCalled();
    expect(logger.info as unknown as Mock).toHaveBeenCalledWith(expect.objectContaining({ msg: 'signIn_event' }));
  });

  it('skips when user already has profilePhoto', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue({ profilePhoto: 'pp.jpg' });
    await handleSignIn({ user: { id: 'u1' }, account: { provider: 'google' }, profile: {} });
    expect(importProfilePic).not.toHaveBeenCalled();
    expect(logger.info as unknown as Mock).toHaveBeenCalledWith(
      expect.objectContaining({ msg: 'signIn_has_profile_photo' }),
    );
  });

  it('imports when no profilePhoto and profile has picture (google)', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue({ profilePhoto: null });
    await handleSignIn({
      user: { id: 'u1' },
      account: { provider: 'google' },
      profile: { picture: 'https://lh3.googleusercontent.com/foo.jpg' },
    });
    expect(importProfilePic).toHaveBeenCalledWith({
      pictureUrl: 'https://lh3.googleusercontent.com/foo.jpg',
      userId: 'u1',
      provider: 'google',
    });
  });

  it('imports when github provider has user.image', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue({ profilePhoto: null });
    await handleSignIn({
      user: { id: 'u2', image: 'https://avatars.githubusercontent.com/u/123?v=4' },
      account: { provider: 'github' },
      profile: {},
    });
    expect(importProfilePic).toHaveBeenCalledWith({
      pictureUrl: 'https://avatars.githubusercontent.com/u/123?v=4',
      userId: 'u2',
      provider: 'github',
    });
  });

  it('imports when facebook provider has user.image', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue({ profilePhoto: null });
    await handleSignIn({
      user: { id: 'u3', image: 'https://platform-lookaside.fbsbx.com/photo.jpg' },
      account: { provider: 'facebook' },
      profile: {},
    });
    expect(importProfilePic).toHaveBeenCalledWith({
      pictureUrl: 'https://platform-lookaside.fbsbx.com/photo.jpg',
      userId: 'u3',
      provider: 'facebook',
    });
  });

  it('imports when mock-oauth provider has user.image', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue({ profilePhoto: null });
    await handleSignIn({
      user: { id: 'u4', image: 'https://i.pravatar.cc/200?u=test@example.com' },
      account: { provider: 'mock-oauth' },
      profile: {},
    });
    expect(importProfilePic).toHaveBeenCalledWith({
      pictureUrl: 'https://i.pravatar.cc/200?u=test@example.com',
      userId: 'u4',
      provider: 'mock-oauth',
    });
  });

  it('extracts large picture from facebook nested structure', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue({ profilePhoto: null });
    await handleSignIn({
      user: { id: 'u3' },
      account: { provider: 'facebook' },
      profile: {
        picture: {
          data: { url: 'https://platform-lookaside.fbsbx.com/platform/profilepic/large.jpg' },
        },
      },
    });
    expect(importProfilePic).toHaveBeenCalledWith({
      pictureUrl: 'https://platform-lookaside.fbsbx.com/platform/profilepic/large.jpg',
      userId: 'u3',
      provider: 'facebook',
    });
  });

  it('falls back to user.image if facebook nested picture.data.url is missing', async () => {
    (prisma.user.findUnique as unknown as Mock).mockResolvedValue({ profilePhoto: null });
    await handleSignIn({
      user: {
        id: 'u3',
        image: 'https://platform-lookaside.fbsbx.com/platform/profilepic/fallback.jpg',
      },
      account: { provider: 'facebook' },
      profile: { picture: { data: {} } },
    });
    expect(importProfilePic).toHaveBeenCalledWith({
      pictureUrl: 'https://platform-lookaside.fbsbx.com/platform/profilepic/fallback.jpg',
      userId: 'u3',
      provider: 'facebook',
    });
  });
});
