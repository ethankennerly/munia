import React from 'react';
import { ConditionalSidebar } from '@/components/ConditionalSidebar';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

/**
 * Layout for unprotected pages (home, login, register, settings, etc.)
 * Uses consistent sidebar pattern matching protected layout:
 * - Sidebar on wide screens (sticky, 212px width)
 * - Bottom navigation on mobile
 * - Responsive content container matching protected pages
 * - Shows MenuBar (protected) for logged-in users, HomeSidebar for logged-out users
 *
 * Note: ConditionalSidebar is already a client component, no need for ClientOnly wrapper
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex md:justify-center md:gap-2">
      <ConditionalSidebar />

      <ResponsiveContainer className="pb-20 pt-4 md:pb-4 md:pt-8">{children}</ResponsiveContainer>
    </div>
  );
}
