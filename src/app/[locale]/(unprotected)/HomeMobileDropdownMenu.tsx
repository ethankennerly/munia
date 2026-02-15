'use client';

import { DropdownMenuButton } from '@/components/ui/DropdownMenuButton';
import { HamburgerMenu } from '@/svg_components';
import { useSession } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import { Key, useCallback, useMemo } from 'react';
import { Item, Section } from 'react-stately';
import { useTranslations } from 'next-intl';

export function HomeMobileDropdownMenu() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const onAction = useCallback((key: Key) => router.push(key as string), [router]);

  const menuItems = useMemo(() => {
    const items = [
      { key: '/terms', label: t('terms') },
      { key: '/privacy-policy', label: t('privacy_policy') },
    ];

    if (isLoggedIn) {
      items.push({ key: '/feed', label: t('components_feedheader') });
    } else {
      items.push({ key: '/login', label: t('login') });
      items.push({ key: '/register', label: t('sign_up') });
    }

    return items;
  }, [isLoggedIn, t]);

  return (
    <DropdownMenuButton
      key="home-dropdown-menu"
      label={t('home_dropdown_menu')}
      onAction={onAction}
      Icon={HamburgerMenu}>
      <Section>
        {menuItems.map((item) => (
          <Item key={item.key}>{item.label}</Item>
        ))}
      </Section>
    </DropdownMenuButton>
  );
}
