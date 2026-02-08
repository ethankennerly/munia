'use client';

import { useTheme } from '@/hooks/useTheme';
import { Select } from '@/components/ui/Select';
import { Item } from 'react-stately';
import { useTranslations } from 'next-intl';

export function ThemeSelect() {
  const t = useTranslations();
  const { theme, handleThemeChange } = useTheme();

  return (
    <Select
      label={t('settings_theme')}
      selectedKey={theme}
      onSelectionChange={(key) => handleThemeChange(key as 'system' | 'light' | 'dark')}
      isClearable={false}>
      <Item key="system">{t('theme_system')}</Item>
      <Item key="light">{t('theme_light')}</Item>
      <Item key="dark">{t('theme_dark')}</Item>
    </Select>
  );
}
