'use client';

import { useLinkStatus } from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

export default function ButtonContent({
  children,
  className,
  linkClassName,
}: {
  children: React.ReactNode;
  className?: string;
  linkClassName?: string;
}) {
  const t = useTranslations();
  const { pending } = useLinkStatus();
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const link = spanRef.current?.closest('a');
    if (!link || !linkClassName) return;
    if (pending) {
      link.classList.add(...linkClassName.split(' '));
    } else {
      link.classList.remove(...linkClassName.split(' '));
    }
  }, [pending, linkClassName]);

  return (
    <span
      ref={spanRef}
      className={`${className ?? ''} ${pending ? 'opacity-50' : ''}`}
      aria-disabled={pending || undefined}>
      {pending ? t('components_loading_page') : children}
    </span>
  );
}
