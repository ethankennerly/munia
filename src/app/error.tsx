'use client';

import { useEffect } from 'react';
import { SomethingWentWrong } from '@/components/SometingWentWrong';
import { useTranslations } from 'next-intl';
import * as Sentry from '@sentry/nextjs';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations();
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <SomethingWentWrong error={error} />
      <button onClick={() => reset()} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
        {t('reset')}
      </button>
    </div>
  );
}
