'use client';

import SvgLoading from '@/svg_components/Loading';
import React from 'react';
import { useTranslations } from 'next-intl';

export function GenericLoading({ children }: { children?: React.ReactNode }) {
  const t = useTranslations();
  return (
    <div className="mt-6 flex flex-col items-center gap-5">
      <div>
        <SvgLoading className="h-12 w-12 animate-spin stroke-foreground" />
      </div>
      <p className="text-lg">{children || t('components_loading_page')}</p>
    </div>
  );
}
