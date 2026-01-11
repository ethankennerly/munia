import { getServerUser } from '@/lib/getServerUser';
import React from 'react';
import { notFound } from 'next/navigation';
import { ProfileHeader } from './ProfileHeader';
import { getProfile } from '../getProfile';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; username: string }>;
}) {
  const [user] = await getServerUser();
  const { username } = await params;
  const profile = await getProfile(username);
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
