import { EditProfileForm } from '@/components/EditProfileForm';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { getServerUser } from '@/lib/getServerUser';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma/prisma';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations();
  const { locale } = await params;

  return {
    title: t('munia_or_setup_profile'),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations();
  const { locale } = await params;

  const [user] = await getServerUser();
  
  // Only redirect if user is logged in AND has complete profile (username and name)
  if (user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { username: true, name: true },
    });
    
    // If user has both username and name, redirect to feed (profile is complete)
    if (dbUser?.username && dbUser?.name) {
      redirect(`/${locale}/feed`);
    }
    // Otherwise, stay on setup page to complete profile
  }

  return (
    <ResponsiveContainer className="mx-auto my-4 px-4 md:px-0">
      <h1 className="mb-1 text-3xl font-bold">{t('welcome_to_munia')}</h1>
      <p className="mb-4 text-muted-foreground">
        {t('please_setup_your_profile_to_proceed_onl')} <b>name</b> and <b>username</b> {t('fields_are_required')}
      </p>
      <EditProfileForm redirectTo={`/${locale}/feed`} />
    </ResponsiveContainer>
  );
}
