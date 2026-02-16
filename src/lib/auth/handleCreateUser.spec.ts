import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

import { logger } from '@/lib/logging';
import { handleCreateUser } from './handleCreateUser';
import { importProfilePic } from './importProfilePic';

vi.mock('@/lib/auth/importProfilePic', () => ({ importProfilePic: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/logging', () => ({ logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));
vi.mock('@/lib/posthog-server', () => ({ getPostHogClient: () => ({ capture: vi.fn(), identify: vi.fn() }) }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleCreateUser', () => {
  it('does nothing when provider is unsupported but logs event', async () => {
    await handleCreateUser({ user: { id: 'u1' }, account: { provider: 'email' }, profile: {} });
    expect(logger.info as unknown as Mock).toHaveBeenCalledWith(expect.objectContaining({ msg: 'createUser_event' }));
    expect(importProfilePic).not.toHaveBeenCalled();
  });

  it('logs when google provider has no picture and does not import', async () => {
    await handleCreateUser({ user: { id: 'u1' }, account: { provider: 'google' }, profile: {} });
    expect(logger.info as unknown as Mock).toHaveBeenCalledWith(expect.objectContaining({ msg: 'createUser_event' }));
    expect(importProfilePic).not.toHaveBeenCalled();
  });

  it('imports when google provider has picture via profile.picture', async () => {
    await handleCreateUser({
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
    await handleCreateUser({
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
    await handleCreateUser({
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
    await handleCreateUser({
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

  it('falls back to profile.avatar_url for github', async () => {
    await handleCreateUser({
      user: { id: 'u2' },
      account: { provider: 'github' },
      profile: { avatar_url: 'https://avatars.githubusercontent.com/u/456?v=4' },
    });
    expect(importProfilePic).toHaveBeenCalledWith({
      pictureUrl: 'https://avatars.githubusercontent.com/u/456?v=4',
      userId: 'u2',
      provider: 'github',
    });
  });

  it('extracts large picture from facebook nested structure', async () => {
    await handleCreateUser({
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
    await handleCreateUser({
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
