import { Gender, RelationshipStatus } from '@prisma/client';
import { snakeCase, toUpper } from 'lodash';

const VALID_GENDERS = new Set<string>(Object.values(Gender));
const VALID_RELATIONSHIP_STATUSES = new Set<string>(Object.values(RelationshipStatus));

function toValidEnum(value: string | null, validValues: Set<string>): string {
  if (!value) return '';
  const normalized = toUpper(snakeCase(value));
  return validValues.has(normalized) ? normalized : '';
}

export function extractDiscoverParams(searchParams: URLSearchParams | null | undefined) {
  if (!searchParams) {
    return { gender: undefined, relationshipStatus: undefined };
  }

  return {
    gender: toValidEnum(searchParams.get('gender'), VALID_GENDERS),
    relationshipStatus: toValidEnum(searchParams.get('relationship-status'), VALID_RELATIONSHIP_STATUSES),
  };
}
