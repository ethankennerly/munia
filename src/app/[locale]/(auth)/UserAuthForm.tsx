'use client';

import Button from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { useToast } from '@/hooks/useToast';
import { AtSign, Facebook, Github, Google, LogInSquare } from '@/svg_components';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';

const emailSchema = z.string().trim().email();
type UserAuthFormProps = {
  // Server-controlled flag:
  emailEnabled?: boolean;
  facebookEnabled?: boolean;
  githubEnabled?: boolean;
  googleEnabled?: boolean;
  mockEnabled?: boolean;
  mockDefaultEmail?: string;
  mockDefaultName?: string;
};

export function UserAuthForm({
  emailEnabled = false,
  facebookEnabled = false,
  githubEnabled = false,
  googleEnabled = false,
  mockEnabled = false,
  mockDefaultEmail = '',
  mockDefaultName = '',
}: UserAuthFormProps) {
  const [email, setEmail] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    email: false,
    github: false,
    facebook: false,
    google: false,
    mock: false,
  });
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  // Disable buttons when loading
  const areButtonsDisabled = loading.email || loading.github || loading.facebook || loading.google || loading.mock;
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from') as string | null;
  const callbackUrl = fromParam ?? `/${locale}/feed`;
  const { showToast } = useToast();
  const oauthErrorShownRef = useRef(false);

  // Intercept NextAuth OAuth error from redirect (?error=OAuthAccountNotLinked)
  useEffect(() => {
    // Avoid duplicate toasts on re-render
    if (oauthErrorShownRef.current) return;
    const error = searchParams?.get('error');
    if (error === 'OAuthAccountNotLinked') {
      oauthErrorShownRef.current = true;
      showToast({
        type: 'error',
        title: t('sign_in_error'),
        message: t('that_facebook_email_already_signed_in_tr'),
      });
      // Clean URL to prevent showing again on navigations
      if (typeof window !== 'undefined') {
        const cleanUrl = window.location.pathname + (window.location.hash || '');
        window.history.replaceState(null, '', cleanUrl);
      }
    }
  }, [searchParams, showToast, t]);

  const onEmailChange = useCallback((text: string) => {
    setEmail(text);
    const validateEmail = emailSchema.safeParse(text);
    if (validateEmail.success) {
      setInputError('');
    }
  }, []);

  const submitEmail = useCallback(async () => {
    setInputError('');
    setLoading((prev) => ({
      ...prev,
      email: true,
    }));

    const validateEmail = emailSchema.safeParse(email);
    if (validateEmail.success) {
      const signInResult = await signIn('email', {
        email: email.toLowerCase(),
        redirect: false,
        callbackUrl,
      });

      setLoading((prev) => ({
        ...prev,
        email: false,
      }));
      if (!signInResult?.ok) {
        showToast({ type: 'error', title: t('something_went_wrong') });
        return;
      }
      if (signInResult?.error) {
        showToast({
          type: 'error',
          title: t('failed_to_send_email'),
          message: t('try_another_provider_to_sign_in_error_si'),
        });
        return;
      }
      showToast({
        type: 'success',
        title: t('email_sent'),
        message: t('please_check_your_email_to_sign_in'),
      });
    } else {
      setInputError(validateEmail.error.issues[0].message);
      setLoading((prev) => ({
        ...prev,
        email: false,
      }));
    }
  }, [email, callbackUrl, showToast, t]);

  const signInWithProvider = useCallback(
    (provider: 'github' | 'google' | 'facebook') => async () => {
      setLoading((prev) => ({
        ...prev,
        [provider]: true,
      }));
      // OAuth providers require a redirect to the third-party site
      // Don't use redirect: false for OAuth providers
      await signIn(provider, {
        callbackUrl,
      });
    },
    [callbackUrl],
  );

  const handleMockSignIn = useCallback(() => {
    // Redirect to mock OAuth page with default values as URL params
    const params = new URLSearchParams();
    if (mockDefaultEmail) params.set('email', mockDefaultEmail);
    if (mockDefaultName) params.set('name', mockDefaultName);
    params.set('callbackUrl', callbackUrl);
    router.push(`/${locale}/mock-oauth?${params.toString()}`);
  }, [mockDefaultEmail, mockDefaultName, callbackUrl, locale, router]);

  return (
    <main>
      <div className="mb-4 flex flex-col gap-3">
        {emailEnabled ? (
          <>
            <TextInput
              value={email}
              onChange={onEmailChange}
              label={t('email')}
              errorMessage={inputError || undefined}
              Icon={AtSign}
            />
            <Button
              onPress={submitEmail}
              shape="pill"
              expand="full"
              Icon={LogInSquare}
              loading={loading.email}
              isDisabled={areButtonsDisabled}>
              {t('email')}
            </Button>
          </>
        ) : null}
        {facebookEnabled ? (
          <Button
            onPress={signInWithProvider('facebook')}
            shape="pill"
            expand="full"
            mode="subtle"
            Icon={Facebook}
            loading={loading.facebook}
            isDisabled={areButtonsDisabled}
            data-activate-id="sign-in-facebook">
            {t('facebook')}
          </Button>
        ) : null}
        {githubEnabled ? (
          <Button
            onPress={signInWithProvider('github')}
            shape="pill"
            expand="full"
            mode="subtle"
            Icon={Github}
            loading={loading.github}
            isDisabled={areButtonsDisabled}
            data-activate-id="sign-in-github">
            {t('github')}
          </Button>
        ) : null}
        {googleEnabled ? (
          <Button
            onPress={signInWithProvider('google')}
            shape="pill"
            expand="full"
            mode="subtle"
            Icon={Google}
            loading={loading.google}
            isDisabled={areButtonsDisabled}
            data-activate-id="sign-in-google">
            {t('google')}
          </Button>
        ) : null}
        {mockEnabled ? (
          <Button
            onPress={handleMockSignIn}
            shape="pill"
            expand="full"
            mode="subtle"
            loading={loading.mock}
            isDisabled={areButtonsDisabled}
            data-activate-id="sign-in-mock">
            Mock OAuth
          </Button>
        ) : null}
      </div>
    </main>
  );
}
