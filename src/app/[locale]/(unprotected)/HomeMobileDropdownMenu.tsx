'use client';

import { DropdownMenuButton } from '@/components/ui/DropdownMenuButton';
import { HamburgerMenu } from '@/svg_components';
import { useRouter } from 'next/navigation';
import { Key, useCallback } from 'react';
import { Item, Section } from 'react-stately';
import { useTranslations } from 'next-intl';

export function HomeMobileDropdownMenu() {
  const t = useTranslations();
  const router = useRouter();
  const onAction = useCallback((key: Key) => router.push(key as string), [router]);
  return (
    <DropdownMenuButton
      key="home-dropdown-menu"
      label={t('home_dropdown_menu')}
      onAction={onAction}
      Icon={HamburgerMenu}>
      <Section>
        <Item key="/terms">{t('terms')}</Item>
        <Item key="/privacy-policy">{t('privacy_policy')}</Item>
        <Item key="/login">{t('login')}</Item>
        <Item key="/register">{t('sign_up')}</Item>
        <Item key="/settings">{t('settings_title')}</Item>
      </Section>
    </DropdownMenuButton>
  );
}
