import React from 'react';
import { ConditionalSidebar } from '@/components/ConditionalSidebar';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

/**
 * Layout for authentication pages (login, register)
 * Uses consistent sidebar pattern matching protected and unprotected layouts:
 * - Sidebar on wide screens (sticky, 212px width)
 * - Bottom navigation on mobile
 * - Responsive content container matching other pages
 * - Shows MenuBar (protected) for logged-in users, HomeSidebar for logged-out users
 *
 * Note: ConditionalSidebar is already a client component, no need for ClientOnly wrapper
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex md:justify-center md:gap-2">
      <ConditionalSidebar />

      <ResponsiveContainer className="pb-20 pt-4 md:pb-4 md:pt-8">
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4">
          <div className="w-full max-w-[428px]">{children}</div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
