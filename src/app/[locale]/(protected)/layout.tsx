import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MenuBar } from '@/components/MenuBar';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useCheckIfRequiredFieldsArePopulated } from '@/hooks/useCheckIfRequiredFieldsArePopulated';
import React from 'react';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  // This runs only once on the initial load of this layout
  // e.g. when the user signs in/up or on hard reload
  await useCheckIfRequiredFieldsArePopulated();

  return (
    <div className="md:flex md:justify-center md:gap-2">
      <MenuBar />

      <ResponsiveContainer className="pb-20 md:pb-4">{children}</ResponsiveContainer>
    </div>
  );
}
