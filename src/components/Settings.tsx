'use client';

import { useTranslations } from 'next-intl';
import { ThemeSelect } from '@/components/ThemeSelect';
import { LanguageSelect } from '@/components/LanguageSelect';
import Link from 'next/link';

/**
 * Reusable Settings component that can be used in both protected and unprotected contexts.
 *
 * Displays user preferences including language and theme settings.
 */
export function Settings() {
  const t = useTranslations();

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="mb-4 mt-4 text-2xl font-bold sm:text-3xl">{t('settings_title')}</h1>
        <p className="text-muted-foreground">{t('settings_description')}</p>
      </div>

      <div className="space-y-6">
        <h2 className="pb-2 text-lg font-bold">{t('settings_preferences')}</h2>

        <div className="flex flex-col gap-4">
          <LanguageSelect />
          <ThemeSelect />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
        <Link href="/terms" className="underline-offset-4 hover:text-primary hover:underline">
          {t('terms')}
        </Link>
        <Link href="/privacy-policy" className="underline-offset-4 hover:text-primary hover:underline">
          {t('privacy_policy')}
        </Link>
      </div>
    </div>
  );
}
