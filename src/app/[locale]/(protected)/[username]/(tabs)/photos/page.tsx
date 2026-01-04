import { GetVisualMedia } from '@/types/definitions';
import { getTranslations } from 'next-intl/server';
import { getProfile } from '../../getProfile';
import { Gallery } from './Gallery';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const { username } = await params;
  const t = await getTranslations();
  const profile = await getProfile(username);

  return {
    title: profile ? t('photos_or_profile_name', { name: profile.name }) : t('photos'),
  };
}

async function getVisualMedia(username: string) {
  const t = await getTranslations();
  const profile = await getProfile(username);
  const res = await fetch(`${process.env.URL}/api/users/${profile?.id}/photos`, { cache: 'no-store' });

  if (!res.ok) throw new Error(t('error_fetching_users_photos'));
  return (await res.json()) as GetVisualMedia[];
}

export default async function Page({ params }: { params: { username: string } }) {
  const visualMedia = await getVisualMedia(params.username);
  return <Gallery visualMedia={visualMedia} />;
}
