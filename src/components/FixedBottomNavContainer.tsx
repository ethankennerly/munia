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
 * Professional Next.js approach: CSS-first solution for maximum performance.
 * - Uses CSS `env(safe-area-inset-bottom)` for device notches (native, zero JS)
 * - Uses `position: fixed; bottom: 0` for viewport-relative positioning
 * - Accepts minor Chrome footer jitter (known Chrome issue, fixing it perfectly causes more problems)
 * - Zero JavaScript overhead - browser handles positioning natively
 */
export function FixedBottomNavContainer({ children, className = '' }: FixedBottomNavContainerProps) {
  // Base classes: CSS-first approach for maximum performance
  // Uses native CSS `env(safe-area-inset-bottom)` - zero JavaScript overhead
  // Browser handles Chrome footer positioning natively (minor jitter is acceptable)
  const baseClasses =
    'fixed bottom-0 z-[2] flex w-full bg-background/70 shadow-inner backdrop-blur-sm pb-safe-area md:sticky md:top-0 md:h-screen md:w-[212px] md:flex-col md:items-start md:bg-inherit md:p-4 md:shadow-none md:backdrop-blur-none';

  return <div className={`${baseClasses} ${className}`}>{children}</div>;
}
