'use client';

import { Feather, GridFeedCards, LogOutCircle, NotificationBell, Profile, Search, WorldNet } from '@/svg_components';
import { useSessionUserData } from '@/hooks/useSessionUserData';
import { useNotificationsCountQuery } from '@/hooks/queries/useNotificationsCountQuery';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LogoText } from './LogoText';
import { MenuBarItem } from './MenuBarItem';
import { FixedBottomNavContainer } from './FixedBottomNavContainer';

export function MenuBar() {
  const t = useTranslations();
  const [user] = useSessionUserData();
  const username = user?.username || 'user-not-found';
  const { data: notificationCount } = useNotificationsCountQuery();

  return (
    <FixedBottomNavContainer>
      <Link href="/" title={t('components_menubar_home')} className="mb-4 hidden items-center gap-2 md:flex">
        <Feather className="h-12 w-12 stroke-primary" />
        <LogoText className="text-3xl" />
      </Link>
      {[
        {
          title: t('components_feedheader'),
          Icon: GridFeedCards,
          route: '/feed',
        },
        {
          title: t('protected_discover_page'),
          Icon: Search,
          route: '/discover',
        },
        {
          title: t('protected_notifications'),
          Icon: NotificationBell,
          route: '/notifications',
          badge: notificationCount,
        },
        { title: t('components_menubar'), Icon: Profile, route: `/${username}` },
        { title: t('settings_title'), Icon: WorldNet, route: '/settings' },
        {
          title: t('components_menubar_logout'),
          Icon: LogOutCircle,
          route: '/api/auth/signout',
        },
      ].map((item) => (
        <MenuBarItem key={item.title} {...item}>
          {item.title}
        </MenuBarItem>
      ))}
    </FixedBottomNavContainer>
  );
}
