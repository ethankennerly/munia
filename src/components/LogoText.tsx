'use client';

import { cn } from '@/lib/cn';
import React from 'react';
import { useTranslations } from 'next-intl';

interface LogoTextProps extends React.HTMLAttributes<HTMLHeadElement> {}
export function LogoText({ ...rest }: LogoTextProps) {
  const t = useTranslations();
  return (
    <h1 {...rest} className={cn('font-bold text-primary', rest.className)}>
      {t('protected_username_tabs_munia')}
    </h1>
  );
}
