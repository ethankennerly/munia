'use client';

import { useLinkStatus } from 'next/link';
import { useTranslations } from 'next-intl';

export default function ButtonContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const t = useTranslations();
  const { pending } = useLinkStatus();

  return (
    <span className={`${className} ${pending ? 'pointer-events-none opacity-50' : ''}`}>
      {pending ? t('components_loading_page') : children}
    </span>
  );
}
