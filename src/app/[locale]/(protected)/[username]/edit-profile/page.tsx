import { EditProfileForm } from '@/components/EditProfileForm';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t('munia_or_edit_profile'),
  };
}

export default function Page() {
  const t = useTranslations();
  return (
    <ResponsiveContainer className="mx-auto mb-4 px-4 md:px-0">
      <h1 className="my-4 text-xl font-bold sm:text-2xl">{t('edit_profile')}</h1>
      <EditProfileForm />
    </ResponsiveContainer>
  );
}
