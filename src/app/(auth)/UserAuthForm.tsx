'use client';

import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { Google } from '@/svg_components';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export function UserAuthForm() {
  const [loading, setLoading] = useState({
    google: false,
  });
  const areButtonsDisabled = loading.google;
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('from') || '/feed';
  const { showToast } = useToast();

  const signInWithProvider = useCallback(
    (provider: 'google') => async () => {
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
      <Button
        onPress={signInWithProvider('google')}
        shape="pill"
        expand="full"
        mode="subtle"
        Icon={Google}
        loading={loading.google}
        isDisabled={areButtonsDisabled}
        data-activate-id="sign-in-google">
        Continue with Google
      </Button>
    </div>
  );
}
