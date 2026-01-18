'use client';

import React from 'react';

interface FixedBottomNavContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared container component for fixed bottom navigation bars.
 * Ensures consistent positioning, alignment, and safe-area handling across
 * both protected (MenuBar) and unprotected (MobileBottomNav) navigation.
 *
 * This is the single source of truth for:
 * - Fixed positioning that responds to Chrome's dynamic address bar
 * - Safe-area-inset handling for device notches
 * - Consistent styling and z-index
 */
export function FixedBottomNavContainer({ children, className = '' }: FixedBottomNavContainerProps) {
  // Base classes shared by both protected and unprotected nav bars
  // Safe-area padding is baked into pb-safe-area CSS class to avoid recalculation during Chrome footer transitions
  const baseClasses =
    'fixed bottom-0 z-[2] flex w-full bg-background/70 shadow-inner backdrop-blur-sm pb-safe-area md:sticky md:top-0 md:h-screen md:w-[212px] md:flex-col md:items-start md:bg-inherit md:p-4 md:shadow-none md:backdrop-blur-none';

  return <div className={`${baseClasses} ${className}`}>{children}</div>;
}
