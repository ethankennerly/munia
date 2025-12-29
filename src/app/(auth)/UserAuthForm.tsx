'use client';

import Button from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { useToast } from '@/hooks/useToast';
import { AtSign, Facebook, Github, Google, LogInSquare } from '@/svg_components';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

const emailSchema = z.string().trim().email();
type UserAuthFormProps = {
  // Server-controlled flag:
  emailEnabled?: boolean;
  facebookEnabled?: boolean;
  githubEnabled?: boolean;
  googleEnabled?: boolean;
};

export function UserAuthForm({
  emailEnabled = false,
  facebookEnabled = false,
  githubEnabled = false,
  googleEnabled = false,
}: UserAuthFormProps) {
  const [email, setEmail] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    email: false,
    github: false,
    facebook: false,
    google: false,
  });
  // Disable buttons when loading
  const areButtonsDisabled = loading.email || loading.github || loading.facebook || loading.google;
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('from') || '/feed';
  const { showToast } = useToast();
  const oauthErrorShownRef = useRef(false);

  // Intercept NextAuth OAuth error from redirect (?error=OAuthAccountNotLinked)
  useEffect(() => {
    // Avoid duplicate toasts on re-render
    if (oauthErrorShownRef.current) return;
    const error = searchParams.get('error');
    if (error === 'OAuthAccountNotLinked') {
      oauthErrorShownRef.current = true;
      showToast({
        type: 'error',
        title: 'Sign in error',
        message: 'That Facebook email already signed in. Try GitHub or Google.',
      });
      // Clean URL to prevent showing again on navigations
      if (typeof window !== 'undefined') {
        const cleanUrl = window.location.pathname + (window.location.hash || '');
        window.history.replaceState(null, '', cleanUrl);
      }
    }
  }, [searchParams, showToast]);

  const onEmailChange = useCallback((text: string) => {
    setEmail(text);
    const validateEmail = emailSchema.safeParse(email);
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
        showToast({ type: 'error', title: 'Something went wrong' });
        return;
      }
      if (signInResult?.error) {
        showToast({
          type: 'error',
          title: 'Failed to Send Email',
          message: `Try another provider to sign in.
(Error: ${signInResult.error})`,
        });
        return;
      }
      showToast({
        type: 'success',
        title: 'Email Sent',
        message: 'Please check your email to sign in.',
      });
    } else {
      setInputError(validateEmail.error.issues[0].message);
      setLoading((prev) => ({
        ...prev,
        email: false,
      }));
    }
  }, [email, callbackUrl, showToast]);

  const signInWithProvider = useCallback(
    (provider: 'github' | 'google' | 'facebook') => async () => {
      setLoading((prev) => ({
        ...prev,
        [provider]: true,
      }));
      const signInResult = await signIn(provider, {
        callbackUrl,
      });
      setLoading((prev) => ({
        ...prev,
        [provider]: false,
      }));
      if (signInResult?.error) {
        showToast({ type: 'error', title: 'Something went wrong' });
      }
    },
    [callbackUrl, showToast],
  );

  return (
    <div className="mb-4 flex flex-col gap-3">
      {emailEnabled ? (
        <>
          <TextInput
            value={email}
            onChange={onEmailChange}
            label="Email"
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
            Email
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
          Facebook
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
          Github
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
          Google
        </Button>
      ) : null}
    </div>
  );
}
