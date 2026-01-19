'use client';

import { useSession } from 'next-auth/react';
import { MenuBar } from './MenuBar';
import { HomeSidebar } from './HomeSidebar';

/**
 * Client component that conditionally renders the appropriate sidebar
 * based on authentication state. Uses client-side session to avoid
 * hydration mismatches between server and client.
 */
export function ConditionalSidebar() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  return isLoggedIn ? <MenuBar /> : <HomeSidebar />;
}
