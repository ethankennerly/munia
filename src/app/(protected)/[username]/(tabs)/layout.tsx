import { getServerUser } from '@/lib/getServerUser';
import React from 'react';
import { ProfileHeader } from './ProfileHeader';
import { getProfile } from '../getProfile';
import { notFound } from 'next/navigation';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { username: string };
}) {
  const [user] = await getServerUser();
  const profile = await getProfile(params.username);
  if (!profile) return notFound();
  const isOwnProfile = profile.id === user?.id;

  return (
    <div className="pb-0">
      <div className="pr-0 md:pr-4">
        <ProfileHeader isOwnProfile={isOwnProfile} initialProfileData={profile} />
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
}
