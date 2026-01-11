'use client';

import enUS from 'date-fns/locale/en-US';
import es from 'date-fns/locale/es';
import { formatDistanceToNowStrict } from 'date-fns';

import type { Locale } from 'date-fns';
import { useLocale } from 'next-intl';

// Map next-intl codes to date-fns locale objects
const localeMap: Record<string, Locale> = {
  en: enUS,
  es,
};

export function useTimeAgo() {
  const currentLocale = useLocale();
  const dateFnsLocale = localeMap[currentLocale] || enUS;

  /**
   * Wrapper for formatDistanceToNowStrict
   * @param date The date to format
   * @param addSuffix Whether to include 'ago' or 'in' (default: true)
   */
  const formatTimeAgo = (date: Date | number, addSuffix = true) =>
    formatDistanceToNowStrict(date, {
      locale: dateFnsLocale,
      addSuffix,
    });

  return { formatTimeAgo };
}
