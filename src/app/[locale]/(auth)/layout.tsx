import { Feather } from '@/svg_components';
import { LogoText } from '@/components/LogoText';
import Link from 'next/link';
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerUser } from '@/lib/getServerUser';
import { HomeMobileDropdownMenu } from '../(unprotected)/HomeMobileDropdownMenu';

function HomeNavLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <h3 className="cursor-pointer px-4 py-3 text-lg font-semibold text-muted-foreground hover:text-primary">
      <Link href={href}>{children}</Link>
    </h3>
  );
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();
  const [user] = await getServerUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex min-h-screen w-full justify-center">
      <div className="w-full max-w-3xl gap-3 py-4 sm:py-8">
        <nav className="sticky top-0 z-10 flex items-center justify-between bg-background/70 px-4 py-4 backdrop-blur-sm sm:px-0 sm:py-4">
          <Link href="/" title={t('home_page')}>
            <div className="flex cursor-pointer flex-row items-center justify-center gap-2 sm:pr-5">
              <Feather className="stroke-primary" width={32} height={32} />
              <LogoText className="text-2xl" />
            </div>
          </Link>
          <div className="hidden gap-3 sm:flex">
            <HomeNavLink href="/terms">{t('terms')}</HomeNavLink>
            <HomeNavLink href="/privacy-policy">{t('privacy_policy')}</HomeNavLink>

            {isLoggedIn ? (
              <HomeNavLink href="/feed">{t('components_feedheader')}</HomeNavLink>
            ) : (
              <>
                <HomeNavLink href="/login">{t('login')}</HomeNavLink>
                <HomeNavLink href="/register">{t('sign_up')}</HomeNavLink>
              </>
            )}

            <HomeNavLink href="/settings">{t('settings_title')}</HomeNavLink>
          </div>
          <div className="sm:hidden">
            <HomeMobileDropdownMenu />
          </div>
        </nav>

        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4">
          <div className="w-full max-w-[428px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
