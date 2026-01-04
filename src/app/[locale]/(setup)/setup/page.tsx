import { EditProfileForm } from '@/components/EditProfileForm';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t('munia_or_setup_profile'),
  };
}

export default async function Page() {
  const t = await getTranslations();
  return (
    <ResponsiveContainer className="mx-auto my-4 px-4 md:px-0">
      <h1 className="mb-1 text-3xl font-bold">{t('welcome_to_munia')}</h1>
      <p className="mb-4 text-muted-foreground">
        {t('please_setup_your_profile_to_proceed_onl')} <b>name</b> and <b>username</b> {t('fields_are_required')}
      </p>
      <EditProfileForm redirectTo="/feed" />
    </ResponsiveContainer>
  );
}
