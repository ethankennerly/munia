// app/[locale]/settings/page.tsx
import { useTranslations } from 'next-intl';
import { ThemeSwitch } from '@/components/ui/ThemeSwitch';
import { LanguageSelect } from '@/components/LanguageSelect';

export default function Settings() {
  const t = useTranslations();

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="mb-4 mt-4 text-4xl font-bold">{t('settings_title')}</h1>
        <p className="text-muted-foreground">{t('settings_description')}</p>
      </div>

      <div className="space-y-6">
        <h2 className="pb-2 text-lg font-bold">{t('settings_preferences')}</h2>

        <div className="flex items-center justify-between">
          <label className="w-1/2 text-muted-foreground">{t('settings_language')}</label>
          <div className="w-1/2">
            <LanguageSelect />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="w-1/2 text-muted-foreground">{t('settings_theme')}</label>
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
}
