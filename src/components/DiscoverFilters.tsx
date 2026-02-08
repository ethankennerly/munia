'use client';

import { Select } from '@/components/ui/Select';
import { Gender, RelationshipStatus } from '@prisma/client';
import { kebabCase, snakeCase, toUpper } from 'lodash';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Item } from 'react-stately';
import { DiscoverFilterKeys, DiscoverFilters as TDiscoverFilters } from '@/types/definitions';
import { Key, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocalizedEnums } from '@/hooks/useLocalizedEnums';

export function DiscoverFilters() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const filters = {
    gender: searchParams?.get('gender') || undefined,
    relationshipStatus: searchParams?.get('relationship-status') || undefined,
  };
  const genderFilters: Gender[] = ['MALE', 'FEMALE', 'NONBINARY'];
  const relationshipStatusFilters: RelationshipStatus[] = ['SINGLE', 'IN_A_RELATIONSHIP', 'ENGAGED', 'MARRIED'];

  const { getClearLabel, getGenderLabel, getRelationshipLabel } = useLocalizedEnums();

  const updateParams = useCallback(
    <T extends DiscoverFilterKeys>({ key, value }: { key: T; value: TDiscoverFilters[T] }) => {
      const newSearchParams = new URLSearchParams(searchParams ?? undefined);

      if (value === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, kebabCase(value));
      }

      const url = `${pathname}?${newSearchParams.toString()}`;
      router.push(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );
  const onSelectGender = useCallback(
    (key: Key | null) => {
      updateParams({
        key: 'gender',
        value: (key && key !== '' ? (key as Gender) : undefined) as TDiscoverFilters['gender'],
      });
    },
    [updateParams],
  );
  const onSelectRelationshipStatus = useCallback(
    (key: Key | null) => {
      updateParams({
        key: 'relationship-status',
        value: (key && key !== '' ? (key as RelationshipStatus) : undefined) as TDiscoverFilters['relationship-status'],
      });
    },
    [updateParams],
  );

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      <div className="flex-1">
        <Select
          label={t('filter_by_gender')}
          selectedKey={toUpper(snakeCase(filters.gender)) || null}
          onSelectionChange={onSelectGender}>
          {[
            <Item key="">{getClearLabel()}</Item>,
            ...genderFilters.map((gender) => <Item key={gender}>{getGenderLabel(gender)}</Item>),
          ]}
        </Select>
      </div>
      <div className="flex-1">
        <Select
          label={t('filter_by_status')}
          selectedKey={toUpper(snakeCase(filters.relationshipStatus)) || null}
          onSelectionChange={onSelectRelationshipStatus}>
          {[
            <Item key="">{getClearLabel()}</Item>,
            ...relationshipStatusFilters.map((relationship) => (
              <Item key={relationship}>{getRelationshipLabel(relationship)}</Item>
            )),
          ]}
        </Select>
      </div>
    </div>
  );
}
