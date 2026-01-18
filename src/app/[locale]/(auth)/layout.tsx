import { LogoText } from '@/components/LogoText';
import Link from 'next/link';
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerUser } from '@/lib/getServerUser';
import { HomeMobileNavBar } from '../(unprotected)/HomeMobileNavBar';
import ClientOnly from '@/components/ui/ClientOnly';

function HomeNavLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <h2 className="cursor-pointer px-4 py-3 text-lg font-semibold text-muted-foreground hover:text-primary">
      <Link href={href}>{children}</Link>
    </h2>
  );
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();
  const [user] = await getServerUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex min-h-screen w-full justify-center">
      <div className="w-full max-w-3xl gap-3 pb-20 pt-4 sm:pb-8 sm:pt-8 md:pb-8">
        <nav className="fixed bottom-0 z-[2] flex w-full items-center justify-between bg-background/70 px-4 py-4 shadow-inner backdrop-blur-sm sm:px-0 sm:py-4 md:sticky md:top-0 md:w-auto md:shadow-none md:backdrop-blur-none">
          <Link href="/" title={t('home_page')} className="hidden items-center gap-2 sm:flex sm:pr-5">
            <LogoText className="text-2xl" />
          </Link>
          <div className="hidden gap-3 sm:flex">
            {isLoggedIn ? (
              <HomeNavLink href="/feed">{t('components_feedheader')}</HomeNavLink>
            ) : (
              <HomeNavLink href="/login">{t('login')}</HomeNavLink>
            )}

            <HomeNavLink href="/settings">{t('settings_title')}</HomeNavLink>
          </div>
          <div className="flex w-full sm:hidden">
            <ClientOnly>
              <HomeMobileNavBar />
            </ClientOnly>
          </div>
        </nav>

        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4">
          <div className="w-full max-w-[428px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
