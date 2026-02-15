'use client';

import { cn } from '@/lib/cn';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/variants/buttonVariants';
import { ButtonProps } from './Button';
import ButtonContent from './ButtonContent';

interface ButtonLinkProps extends ButtonProps {
  href: string;
  prefetch?: boolean;
}

export function ButtonLink({
  href,
  children,
  size,
  mode,
  shape,
  expand,
  prefetch = false,
  'data-activate-id': activateId,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      data-activate-id={activateId}
      className={cn(
        buttonVariants({ size, mode, shape, expand }),
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
      )}>
      <ButtonLinkInner>{children}</ButtonLinkInner>
    </Link>
  );
}

function ButtonLinkInner({ children }: { children: React.ReactNode }) {
  return <ButtonContent linkClassName="pointer-events-none">{children}</ButtonContent>;
}
