'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FallbackProfilePhoto } from './FallbackProfilePhoto';

export function ProfilePhoto({
  name,
  photoUrl,
  username,
  fallbackAvatarClassName,
  priority = false,
}: {
  name: string;
  username: string;
  photoUrl?: string | null;
  fallbackAvatarClassName?: string;
  /** Set to true for above-the-fold images to improve LCP. */
  priority?: boolean;
}) {
  const t = useTranslations();
  return (
    <Link href={`/${username}`} className="block h-full w-full">
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={t('name_s_avatar', { username })}
          width={80}
          height={80}
          sizes="(min-width: 640px) 80px, 64px"
          className="h-full w-full cursor-pointer rounded-full bg-muted object-cover"
          priority={priority}
        />
      ) : (
        <FallbackProfilePhoto name={name} className={fallbackAvatarClassName} />
      )}
    </Link>
  );
}
