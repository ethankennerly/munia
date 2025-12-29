/* eslint-disable import/first, import/order */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

import { logger } from '@/lib/logging';
import { handleCreateUser } from './handleCreateUser';
import { importGoogleProfilePic } from './importGoogleProfilePic';

vi.mock('@/lib/auth/importGoogleProfilePic', () => ({ importGoogleProfilePic: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/logging', () => ({ logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleCreateUser', () => {
  it('does nothing when provider is not google but logs event', async () => {
    await handleCreateUser({ user: { id: 'u1' }, account: { provider: 'github' }, profile: {} });
    expect(logger.info as unknown as Mock).toHaveBeenCalledWith(expect.objectContaining({ msg: 'createUser_event' }));
    expect(importGoogleProfilePic).not.toHaveBeenCalled();
  });

  it('logs when google provider has no picture and does not import', async () => {
    await handleCreateUser({ user: { id: 'u1' }, account: { provider: 'google' }, profile: {} });
    expect(logger.info as unknown as Mock).toHaveBeenCalledWith(expect.objectContaining({ msg: 'createUser_event' }));
    expect(importGoogleProfilePic).not.toHaveBeenCalled();
  });

  it('imports when google provider has picture', async () => {
    await handleCreateUser({
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
