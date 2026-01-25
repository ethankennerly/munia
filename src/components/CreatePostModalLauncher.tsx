'use client';

import { useCreatePostModal } from '@/hooks/useCreatePostModal';
import SvgImage from '@/svg_components/Image';
import { useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ProfilePhotoOwn } from './ui/ProfilePhotoOwn';
import { ButtonNaked } from './ui/ButtonNaked';

export function CreatePostModalLauncher() {
  const t = useTranslations();
  const { launchCreatePost } = useCreatePostModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const launcCreatePostFinderClosed = useCallback(() => launchCreatePost({}), [launchCreatePost]);
  const onMediaChosen = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.length) launchCreatePost({ initialFiles: Array.from(files) });
      e.target.value = '';
    },
    [launchCreatePost],
  );
  const launchCreatePostFinderOpened = useCallback(() => fileInputRef.current?.click(), []);

  return (
    <div className="rounded-xl bg-card px-4 py-4 shadow sm:px-8 sm:py-5">
      <div className="mb-[18px] flex flex-row">
        <div className="mr-3 h-12 w-12">
          <ProfilePhotoOwn />
        </div>
        <ButtonNaked
          onPress={launcCreatePostFinderClosed}
          className="flex flex-grow flex-col justify-center"
          data-activate-id="create-post-text">
          <p className="text-muted-foreground">{t('components_what_apos_your')}</p>
        </ButtonNaked>
      </div>
      <div className="flex flex-row gap-4">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="video/*,.jpg,.jpeg,.png"
          multiple
          onChange={onMediaChosen}
        />
        <ButtonNaked
          onPress={launchCreatePostFinderOpened}
          className="group flex cursor-pointer flex-row items-center gap-4"
          data-activate-id="create-post-media">
          <SvgImage className="h-6 w-6 text-muted-foreground" />
          <p className="text-base font-semibold text-muted-foreground group-hover:text-muted-foreground/80">
            {t('image_video')}
          </p>
        </ButtonNaked>
        {/* <ButtonNaked className="group flex cursor-pointer flex-row items-center gap-4">
          <EmojiHappySmile stroke="black" width={24} height={24} />
          <p className="text-base font-semibold text-gray-500 group-hover:text-black">
            Mood
          </p>
        </ButtonNaked> */}
      </div>
    </div>
  );
}
