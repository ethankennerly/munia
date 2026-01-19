import { Settings as SettingsComponent } from '@/components/Settings';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t('settings_title'),
  };
}

/**
 * Settings page - uses consistent layout from parent unprotected layout
 * The layout automatically shows MenuBar for logged-in users or HomeSidebar for logged-out users
 */
export default async function SettingsPage() {
  return (
    <main>
      <div className="px-4 pt-4">
        <SettingsComponent />
      </div>
    </main>
  );
}
