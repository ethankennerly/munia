'use client';

import React, { useEffect, useState } from 'react';
import { CreatePostModalLauncher } from '@/components/CreatePostModalLauncher';
import { useTranslations } from 'next-intl';

// Module-level flag that persists across all component instances
// This ensures components never disappear once they've been mounted, even if
// the component is unmounted and remounted (e.g., during server component re-renders)
let hasEverMounted = false;

/**
 * FeedHeader component that renders the Feed title and CreatePostModalLauncher.
 * This component ensures these elements persist across re-renders and only appear after
 * JavaScript has fully loaded, preventing layout shift and flicker during slow network conditions.
 *
 * Uses a module-level flag to ensure components never disappear once mounted, even if
 * the component instance is recreated.
 */
export function FeedHeader() {
  const t = useTranslations();
  const [hasMounted, setHasMounted] = useState(hasEverMounted);

  useEffect(() => {
    // Mark as mounted - this persists across all component instances
    hasEverMounted = true;
    setHasMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">{t('components_feedheader')}</h1>
      </div>
      <CreatePostModalLauncher />
    </>
  );
}
