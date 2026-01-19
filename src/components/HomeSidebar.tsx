'use client';

import { Feather, GridFeedCards, LogInSquare, WorldNet } from '@/svg_components';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { LogoText } from './LogoText';
import { MenuBarItem } from './MenuBarItem';
import { FixedBottomNavContainer } from './FixedBottomNavContainer';

/**
 * Sidebar navigation for unprotected pages (home, login, register, etc.)
 * Provides consistent sidebar layout matching the protected MenuBar pattern:
 * - Logo with Feather icon at top on wide screens
 * - Navigation items with icons and names
 * - Sticky sidebar on wide screens, bottom nav on mobile
 */
export function HomeSidebar() {
  const t = useTranslations();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const menuItems = [
    ...(isLoggedIn
      ? [
          {
            title: t('components_feedheader'),
            Icon: GridFeedCards,
            route: '/feed',
          },
        ]
      : [
          {
            title: t('login'),
            Icon: LogInSquare,
            route: '/login',
          },
        ]),
    {
      title: t('settings_title'),
      Icon: WorldNet,
      route: '/settings',
    },
  ];

  return (
    <FixedBottomNavContainer>
      <Link href="/" title={t('home_page')} className="mb-4 hidden items-center gap-2 md:flex">
        <Feather className="h-12 w-12 stroke-primary" />
        <LogoText className="text-3xl" />
      </Link>
      {menuItems.map((item) => (
        <MenuBarItem key={item.title} {...item}>
          {item.title}
        </MenuBarItem>
      ))}
    </FixedBottomNavContainer>
  );
}
