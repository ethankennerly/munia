/* eslint-disable react-perf/jsx-no-new-function-as-prop */

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { WorldNet } from '@/svg_components';
import { Item } from 'react-stately';
import { Select } from './ui/Select';

function toLocaleTitleCase(locale: string) {
  const localizedText = new Intl.DisplayNames([locale], { type: 'language' }).of(locale);
  if (!localizedText) return locale;
  return localizedText.charAt(0).toLocaleUpperCase(locale) + localizedText.slice(1);
}

export function LanguageSelect() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function onLanguageChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Select
      label={t('settings_language')}
      name="language"
      selectedKey={locale || ''}
      onSelectionChange={(key) => onLanguageChange(key ? key.toString() : '')}
      Icon={WorldNet}>
      {routing.locales.map((loc) => (
        <Item key={loc}>{toLocaleTitleCase(loc)}</Item>
      ))}
    </Select>
  );
}
