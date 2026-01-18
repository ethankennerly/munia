'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Client component that conditionally hides the unprotected layout navigation
 * when on Settings page and logged in (since Settings page renders its own MenuBar).
 */
export function SettingsNavHandler({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    if (isLoggedIn && pathname?.includes('/settings')) {
      // Hide the unprotected layout's navigation
      const nav = document.querySelector('nav.sticky');
      if (nav) {
        (nav as HTMLElement).style.display = 'none';
      }
    } else {
      // Show the navigation
      const nav = document.querySelector('nav.sticky');
      if (nav) {
        (nav as HTMLElement).style.display = '';
      }
    }
  }, [isLoggedIn, pathname]);

  return null;
}
