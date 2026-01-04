import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { UserAuthForm } from '../UserAuthForm';

export async function generateMetadata() {
  const t = await getTranslations();
  return {
    title: t('munia_or_login'),
  };
}

export default function Page() {
  const t = useTranslations();
  const { env } = process;
  const emailEnabled = Boolean(env.SES_ACCESS_KEY_ID && env.SES_SECRET_ACCESS_KEY);
  const facebookEnabled = Boolean(env.AUTH_FACEBOOK_ID && env.AUTH_FACEBOOK_SECRET);
  const githubEnabled = Boolean(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET);
  const googleEnabled = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
  return (
    <>
      <h1 className="mb-5 text-5xl font-bold">{t('login')}</h1>
      <UserAuthForm
        emailEnabled={emailEnabled}
        facebookEnabled={facebookEnabled}
        githubEnabled={githubEnabled}
        googleEnabled={googleEnabled}
      />
      <p className="text-lg text-muted-foreground">{t('no_account_yet')}</p>
      <p className="cursor-pointer text-lg font-semibold text-primary-accent hover:opacity-90">
        <Link href="/register" prefetch data-activate-id="register-link">
          {t('create_an_account')}
        </Link>
      </p>
    </>
  );
}
