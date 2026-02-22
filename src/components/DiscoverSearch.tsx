'use client';

import { TextInput } from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import SvgSearch from '@/svg_components/Search';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';

export function DiscoverSearch({ label }: { label?: string }) {
  const t = useTranslations();
  const resolvedLabel = label ?? t('components_search_people');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [inputValue, setInputValue] = useState(searchParams?.get('search') ?? '');

  const pushSearch = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams ?? undefined);
      if (search === '') {
        params.delete('search');
      } else {
        params.set('search', search);
      }
      const url = `${pathname}?${params.toString()}`;
      router.push(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleChange = useCallback(
    (value: string) => {
      setInputValue(value);
      // When the clear (X) button empties the field, immediately clear the URL param too.
      if (value === '') {
        pushSearch('');
      }
    },
    [pushSearch],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      pushSearch(inputValue);
    },
    [inputValue, pushSearch],
  );

  return (
    <div className="sticky top-4 z-[2] mb-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1">
          <TextInput value={inputValue} onChange={handleChange} label={resolvedLabel} />
        </div>
        <Button
          Icon={SvgSearch}
          iconClassName="stroke-secondary-foreground"
          mode="secondary"
          onPress={() => pushSearch(inputValue)}
          aria-label={t('components_search_submit')}
        />
      </form>
    </div>
  );
}
