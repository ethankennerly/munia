'use client';

import { TextInput } from '@/components/ui/TextInput';
import SvgSearch from '@/svg_components/Search';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import posthog from 'posthog-js';

export function DiscoverSearch({ label }: { label?: string }) {
  const t = useTranslations();
  const resolvedLabel = label ?? t('components_search_people');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams ?? undefined);
      if (search === '') {
        params.delete('search');
      } else {
        params.set('search', search);

        // Debounce search tracking to avoid tracking every keystroke
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          posthog.capture('user_search_performed', {
            search_query_length: search.length,
          });
        }, 1000);
      }

      const url = `${pathname}?${params.toString()}`;
      router.push(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const searchValue = searchParams?.get('search') ?? '';

  return (
    <div className="sticky top-4 z-[2] mb-4">
      <TextInput value={searchValue} onChange={handleChange} label={resolvedLabel} Icon={SvgSearch} />
    </div>
  );
}
