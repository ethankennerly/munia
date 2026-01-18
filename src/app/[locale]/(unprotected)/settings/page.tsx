import { Settings as SettingsComponent } from '@/components/Settings';
import { getTranslations } from 'next-intl/server';
import { getServerUser } from '@/lib/getServerUser';
import { MenuBar } from '@/components/MenuBar';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t('settings_title'),
  };
}

export default async function SettingsPage() {
  const [user] = await getServerUser();
  const isLoggedIn = !!user;

  // When logged in, render protected layout structure (MenuBar sidebar)
  // The SettingsNavHandler in the layout will hide the unprotected navigation
  if (isLoggedIn) {
    return (
      <div className="md:flex md:justify-center md:gap-2">
        <MenuBar />
        <ResponsiveContainer className="pb-20 md:pb-4">
          <main>
            <div className="px-4 pt-4">
              <SettingsComponent />
            </div>
          </main>
        </ResponsiveContainer>
      </div>
    );
  }

  // When not logged in, just render content (unprotected layout handles navigation)
  return (
    <main>
      <div className="px-4 pt-4">
        <SettingsComponent />
      </div>
    </main>
  );
}
