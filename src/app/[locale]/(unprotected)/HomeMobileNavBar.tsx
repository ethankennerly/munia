'use client';

import { Feather, GridFeedCards, LogInSquare, WorldNet } from '@/svg_components';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MenuBarItem } from '@/components/MenuBarItem';

export function HomeMobileNavBar() {
  const t = useTranslations();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const menuItems = useMemo(() => {
    const items = [
      {
        title: t('munia'),
        Icon: Feather,
        route: '/',
      },
    ];

    if (isLoggedIn) {
      items.push({
        title: t('components_feedheader'),
        Icon: GridFeedCards,
        route: '/feed',
      });
    } else {
      items.push({
        title: t('login'),
        Icon: LogInSquare,
        route: '/login',
      });
    }

    items.push({
      title: t('settings_title'),
      Icon: WorldNet,
      route: '/settings',
    });

    return items;
  }, [isLoggedIn, t]);

  return (
    <>
      {menuItems.map((item) => (
        <MenuBarItem key={item.route} {...item}>
          {item.title}
        </MenuBarItem>
      ))}
    </>
  );
}
