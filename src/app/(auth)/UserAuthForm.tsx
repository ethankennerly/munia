'use client';

import Button from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { useToast } from '@/hooks/useToast';
import { AtSign, Facebook, Github, Google, LogInSquare } from '@/svg_components';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
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

  const onEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const submitEmail = useCallback(async () => {
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
