import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  // Standard: Hide the prefix for the default language
  localePrefix: 'as-needed',
});
