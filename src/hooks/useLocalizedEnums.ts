'use client';

import { useTranslations } from 'next-intl';
import { Gender, RelationshipStatus } from '@prisma/client';

export function useLocalizedEnums() {
  const t = useTranslations();

  // Map gender values to their translated equivalents
  const getGenderLabel = (gender: Gender | null) => {
    switch (gender) {
      case Gender.MALE:
        return t('components_male');
      case Gender.FEMALE:
        return t('components_female');
      case Gender.NONBINARY:
        return t('components_nonbinary');
      default:
        return '';
    }
  };

  // Map relationship statuses to their translated equivalents
  const getRelationshipLabel = (status: RelationshipStatus | null) => {
    switch (status) {
      case RelationshipStatus.SINGLE:
        return t('components_single');
      case RelationshipStatus.IN_A_RELATIONSHIP:
        return t('components_relationship');
      case RelationshipStatus.ENGAGED:
        return t('components_engaged');
      case RelationshipStatus.MARRIED:
        return t('components_married');
      default:
        return '';
    }
  };

  return { getGenderLabel, getRelationshipLabel };
}
