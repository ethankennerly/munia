'use client';

import React from 'react';
import { CreatePostModalLauncher } from '@/components/CreatePostModalLauncher';
import { useTranslations } from 'next-intl';

/**
 * Skeleton placeholder that reserves the same space as the rendered FeedHeader.
 * Used by loading.tsx (Suspense fallback) while the server component resolves.
 * Matches dimensions of: title (h-8 mb-4) + CreatePostModalLauncher card.
 */
export function FeedHeaderSkeleton() {
  return (
    <>
      {/* "Feed" title skeleton: text-2xl ≈ h-8 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="animate-shimmer h-8 w-20 rounded" />
      </div>

      {/* CreatePostModalLauncher skeleton: rounded-xl bg-card, avatar + text + media button.
          No mb-4 — real CreatePostModalLauncher has no bottom margin;
          BidirectionalScroll's paddingTop:16px provides the gap below. */}
      <div className="rounded-xl bg-card px-4 py-4 shadow sm:px-8 sm:py-5">
        <div className="mb-[18px] flex flex-row">
          <div className="animate-shimmer mr-3 h-12 w-12 rounded-full" />
          <div className="flex flex-grow flex-col justify-center">
            <div className="animate-shimmer h-5 w-40 rounded" />
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div className="animate-shimmer h-6 w-6 rounded" />
          <div className="animate-shimmer h-5 w-20 rounded" />
        </div>
      </div>
    </>
  );
}

/**
 * FeedHeader renders the Feed title and CreatePostModalLauncher.
 * Renders real content during SSR — all hooks (useTranslations, useCreatePostModal,
 * useSession via ProfilePhotoOwn) work during server rendering. This eliminates CLS
 * because the content occupies correct space from the first paint.
 */
export function FeedHeader() {
  const t = useTranslations();

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">{t('components_feedheader')}</h1>
      </div>
      <CreatePostModalLauncher />
    </>
  );
}
