import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales: string[] = ['en', 'es'];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || 'en';

  if (!locales.includes(locale)) notFound();

  return {
    locale,
    messages: (await import(`/src/i18n/${locale}.json`)).default,
  };
});
