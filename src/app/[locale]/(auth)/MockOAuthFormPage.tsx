'use client';

import { useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { TextInput } from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import { useTranslations, useLocale } from 'next-intl';
import { signIn } from 'next-auth/react';
// Shared validation schemas with setup page
import { emailSchema, nonEmptyString as nameSchema } from '@/lib/validations/userAbout';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

interface MockOAuthFormPageProps {
  defaultEmail?: string;
  defaultName?: string;
  callbackUrl?: string;
}

export function MockOAuthFormPage({ defaultEmail, defaultName, callbackUrl: propCallbackUrl }: MockOAuthFormPageProps) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [name, setName] = useState(defaultName || '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get callbackUrl from props or URL params
  const callbackUrl = propCallbackUrl || searchParams?.get('callbackUrl') || `/${locale}/feed`;

  // Update form if URL params change (for browser back/forward)
  useEffect(() => {
    const urlEmail = searchParams?.get('email');
    const urlName = searchParams?.get('name');
    if (urlEmail !== null) setEmail(urlEmail);
    if (urlName !== null) setName(urlName);
  }, [searchParams]);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    const validateEmail = emailSchema.safeParse(text);
    if (validateEmail.success) {
      setEmailError(null);
    }
  }, []);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    const validateName = nameSchema.safeParse(text);
    if (validateName.success) {
      setNameError(null);
    }
  }, []);

  const handleContinue = useCallback(async () => {
    setEmailError(null);
    setNameError(null);

    const emailValidation = emailSchema.safeParse(email);
    const nameValidation = nameSchema.safeParse(name);

    if (!emailValidation.success) {
      setEmailError(emailValidation.error.issues[0]?.message || 'Invalid email');
      return;
    }

    if (!nameValidation.success) {
      setNameError(nameValidation.error.issues[0]?.message || 'Name is required');
      return;
    }

    setLoading(true);
    try {
      // "Standard login flow" simulation: sign in with credentials
      const result = await signIn('mock-oauth', {
        email: emailValidation.data.toLowerCase(),
        name: nameValidation.data,
        redirect: false,
        callbackUrl,
      });

      if (result?.ok) {
        router.push(callbackUrl);
      } else {
        // Handle error (e.g., invalid credentials)
        setEmailError(t('something_went_wrong') || 'Something went wrong');
        setLoading(false);
      }
    } catch {
      setEmailError(t('something_went_wrong') || 'Something went wrong');
      setLoading(false);
    }
  }, [email, name, callbackUrl, router, t]);

  const handleCancel = useCallback(() => {
    // "Standard refusal" simulation: redirect back to login
    router.push(`/${locale}/login`);
  }, [router, locale]);

  return (
    <ResponsiveContainer className="mx-auto my-4 px-4 md:px-0">
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">Mock OAuth Provider</h1>
      <div className="flex w-full max-w-md flex-col gap-4">
        <TextInput
          value={name}
          onChange={handleNameChange}
          label={t('name_0') || t('name') || 'Name'}
          errorMessage={nameError || undefined}
          autoFocus
        />
        <TextInput
          value={email}
          onChange={handleEmailChange}
          label={t('email') || 'Email'}
          errorMessage={emailError || undefined}
          type="email"
        />
        <div className="flex w-full gap-3">
          <Button onPress={handleContinue} shape="pill" expand="half" loading={loading} isDisabled={loading}>
            {t('components_confirmdialog')}
          </Button>
          <Button onPress={handleCancel} shape="pill" mode="ghost" expand="half" isDisabled={loading}>
            {t('components_confirmdialog_cancel')}
          </Button>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
