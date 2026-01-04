'use client';

import { CircleActionsAlertInfo } from '@/svg_components';
import { useTranslations } from 'next-intl';

interface SomethingWentWrongProps {
  error?: Error | string | null;
  details?: string;
}

export function SomethingWentWrong({ error, details }: SomethingWentWrongProps = {}) {
  const t = useTranslations();
  const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : null;
  const errorName = error instanceof Error ? error.name : null;

  // Create user-friendly error message
  let displayMessage = t('components_something_went_wrong');
  if (errorMessage) {
    // Show the actual error message if available
    displayMessage = errorMessage;
  } else if (details) {
    displayMessage = details;
  }

  // Add error type context if available and different from generic "Error"
  const errorContext = errorName && errorName !== 'Error' ? ` (${errorName})` : '';

  return (
    <div className="mt-6 grid place-items-center">
      <div className="inline-block rounded-xl bg-destructive px-8 py-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <CircleActionsAlertInfo className="stroke-destructive-foreground" width={24} height={24} />
            <p className="break-words text-lg font-semibold text-destructive-foreground">
              {displayMessage}
              {errorContext}
            </p>
          </div>
          {details && details !== displayMessage && (
            <p className="break-words text-center text-sm text-destructive-foreground/80">{details}</p>
          )}
        </div>
      </div>
    </div>
  );
}
