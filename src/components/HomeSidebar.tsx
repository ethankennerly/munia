'use client';

import { Feather, GridFeedCards, LogInSquare, WorldNet } from '@/svg_components';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { MenuBarItem } from './MenuBarItem';
import { FixedBottomNavContainer } from './FixedBottomNavContainer';

/**
 * Sidebar navigation for unprotected pages (home, login, register, etc.)
 * Provides consistent sidebar layout matching the protected MenuBar pattern:
 * - Navigation items with icons and names
 * - Sticky sidebar on wide screens, bottom nav on mobile
 * - Home button as first item to navigate back to root
 */
export function HomeSidebar() {
  const t = useTranslations();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const menuItems = [
    {
      title: t('munia'),
      Icon: Feather,
      route: '/',
    },
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
      {menuItems.map((item) => (
        <MenuBarItem key={item.title} {...item}>
          {item.title}
        </MenuBarItem>
      ))}
    </FixedBottomNavContainer>
  );
}
