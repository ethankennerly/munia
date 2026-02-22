'use client';

import { useActiveRouteChecker } from '@/hooks/useActiveRouteChecker';
import { useDialogs } from '@/hooks/useDialogs';
import { cn } from '@/lib/cn';
import { signOut } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import React, { SVGProps, ReactElement, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from './ui/Badge';
import { ButtonNaked } from './ui/ButtonNaked';
import posthog from 'posthog-js';

export function MenuBarItem({
  children,
  Icon,
  route,
  badge,
}: {
  children: React.ReactNode;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  route: string;
  badge?: number;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [isActive] = useActiveRouteChecker(route);
  const { confirm } = useDialogs();

  const onItemClick = useCallback(() => {
    if (route === '/api/auth/signout') {
      confirm({
        title: t('components_menubaritem'),
        message: t('components_menubaritem_you_really_wish'),
        onConfirm: async () => {
          try {
            // Use redirect: false to prevent client-side redirect, then manually redirect with correct origin
            await signOut({ redirect: false });
          } catch (error) {
            // Log error but continue with redirect even if signOut fails
            console.error('Sign out error:', error);
          }

          if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            posthog.reset();
          }
          // Manually redirect using router to ensure correct origin (mobile device IP)
          // Redirect even if signOut failed to ensure user is logged out on client side
          router.push('/');
        },
      });
    } else {
      router.push(route);
    }
  }, [route, router, confirm, t]);

  useEffect(() => {
    if (route === '/api/auth/signout') return;
    router.prefetch(route);
  }, [route, router]);

  // Generate activation ID from route
  const activateId =
    route === '/api/auth/signout' ? 'sign-out' : route.replace(/^\//, '').replace(/\//g, '-') || 'home';

  return (
    <ButtonNaked
      aria-label={children as string}
      className="group relative flex h-14 flex-1 cursor-pointer flex-row items-center justify-center px-4 hover:bg-primary-accent/30 md:mt-2 md:flex-none md:rounded-lg md:last:mt-auto"
      onPress={onItemClick}
      data-activate-id={activateId}>
      <div
        className={cn(
          'absolute left-0 hidden h-10 w-[4px] origin-bottom scale-y-0 rounded-r-lg bg-primary transition-transform group-hover:origin-top group-hover:scale-y-100 md:block',
          isActive && 'scale-y-100',
        )}
      />
      <div
        className={cn(
          'absolute bottom-0 h-[4px] w-[70%] scale-x-0 rounded-t-lg bg-primary transition-transform group-hover:scale-x-100 md:hidden',
          isActive && 'scale-x-100',
        )}
      />
      <div className="relative md:mr-3">
        <Icon className="h-6 w-6 stroke-muted-foreground" />
        {badge !== undefined && badge !== 0 && (
          <div className="absolute right-[-25%] top-[-50%]">
            <Badge>{badge}</Badge>
          </div>
        )}
      </div>
      <p className={cn('hidden text-base transition-colors duration-300 md:block', isActive && 'font-bold')}>
        {children}
      </p>
    </ButtonNaked>
  );
}
