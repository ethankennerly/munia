'use client';

import { cn } from '@/lib/cn';
import { Play } from '@/svg_components';
import { VisualMediaType } from '@prisma/client';
import { useMemo } from 'react';
import { mergeProps, useFocusRing, usePress } from 'react-aria';
import { useTranslations } from 'next-intl';

export function PostVisualMedia({
  type,
  url,
  onClick,
  height,
  colSpan,
}: {
  type: VisualMediaType;
  url: string;
  onClick: () => void;
  height: string;
  colSpan: number;
}) {
  const t = useTranslations();
  const { pressProps, isPressed } = usePress({
    onPress: onClick,
  });
  const { focusProps, isFocusVisible } = useFocusRing();
  const style = useMemo(() => ({ height }), [height]);
  return (
    <div
      {...mergeProps(pressProps, focusProps)}
      aria-label={type === 'PHOTO' ? t('components_image_post') : t('components_video_post')}
      role="button"
      tabIndex={0}
      className={cn(
        'group relative cursor-pointer focus:outline-none',
        colSpan === 1 ? 'col-span-1' : 'col-span-2',
        isFocusVisible && 'border-4 border-violet-500',
      )}
      style={style}>
      {type === 'PHOTO' ? (
        <img src={url} alt="" className={cn('h-full w-full object-cover', isPressed && 'brightness-75')} />
      ) : (
        <>
          <Play
            width={72}
            height={72}
            className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] stroke-violet-100 transition-transform group-hover:scale-125"
          />
          {}
          <video className="h-full w-full object-cover">
            <source src={url} type="video/mp4" />
            {t('your_browser_does_not_support_the_video_')}
          </video>
        </>
      )}
    </div>
  );
}
