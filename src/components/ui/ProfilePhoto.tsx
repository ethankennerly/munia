'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FallbackProfilePhoto } from './FallbackProfilePhoto';

export function ProfilePhoto({
  name,
  photoUrl,
  username,
  fallbackAvatarClassName,
}: {
  name: string;
  username: string;
  photoUrl?: string | null;
  fallbackAvatarClassName?: string;
}) {
  const t = useTranslations();
  return (
    <Link href={`/${username}`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={t('name_s_avatar', { username })}
          className="h-full w-full cursor-pointer rounded-full bg-muted object-cover"
        />
      ) : (
        <FallbackProfilePhoto name={name} className={fallbackAvatarClassName} />
      )}
    </Link>
  );
}
