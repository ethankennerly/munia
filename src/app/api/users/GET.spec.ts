import { describe, it, expect } from 'vitest';
import { extractDiscoverParams } from '@/lib/api/extractDiscoverParams';

describe('extractDiscoverParams - Unit Tests', () => {
  describe('Empty string parameters', () => {
    it('should return empty string for gender when param is empty string', () => {
      const params = new URLSearchParams('?gender=');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('');
    });

    it('should return empty string for relationship-status when param is empty string', () => {
      const params = new URLSearchParams('?relationship-status=');
      const result = extractDiscoverParams(params);
      expect(result.relationshipStatus).toBe('');
    });
  });

  describe('Valid parameter transformations', () => {
    it('should convert "male" to "MALE"', () => {
      const params = new URLSearchParams('?gender=male');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('MALE');
    });

    it('should convert "single" to "SINGLE"', () => {
      const params = new URLSearchParams('?relationship-status=single');
      const result = extractDiscoverParams(params);
      expect(result.relationshipStatus).toBe('SINGLE');
    });

    it('should convert "in_a_relationship" to "IN_A_RELATIONSHIP"', () => {
      const params = new URLSearchParams('?relationship-status=in_a_relationship');
      const result = extractDiscoverParams(params);
      expect(result.relationshipStatus).toBe('IN_A_RELATIONSHIP');
    });
  });

  describe('Kebab-case to snake-case conversion', () => {
    it('should reject "non-binary" → "" since NONBINARY has no underscore', () => {
      const params = new URLSearchParams('?gender=non-binary');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('');
    });
  });

  describe('Invalid enum values', () => {
    it('should reject "invalid_gender" → "" instead of passing to database', () => {
      const params = new URLSearchParams('?gender=invalid_gender');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('');
    });

    it('should reject "not_a_status" → "" instead of passing to database', () => {
      const params = new URLSearchParams('?relationship-status=not_a_status');
      const result = extractDiscoverParams(params);
      expect(result.relationshipStatus).toBe('');
    });
  });

  describe('Case normalization', () => {
    it('should normalize "Male" to "MALE"', () => {
      const params = new URLSearchParams('?gender=Male');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('MALE');
    });

    it('should normalize "Single" to "SINGLE"', () => {
      const params = new URLSearchParams('?relationship-status=Single');
      const result = extractDiscoverParams(params);
      expect(result.relationshipStatus).toBe('SINGLE');
    });

    it('should handle all uppercase "FEMALE"', () => {
      const params = new URLSearchParams('?gender=FEMALE');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('FEMALE');
    });
  });

  describe('Null and undefined handling', () => {
    it('should return undefined for both when searchParams is null', () => {
      const params = null;
      const result = extractDiscoverParams(params);
      expect(result.gender).toBeUndefined();
      expect(result.relationshipStatus).toBeUndefined();
    });

    it('should return undefined for both when searchParams is undefined', () => {
      const params = undefined;
      const result = extractDiscoverParams(params);
      expect(result.gender).toBeUndefined();
      expect(result.relationshipStatus).toBeUndefined();
    });
  });

  describe('Multiple parameters', () => {
    it('should extract both gender and relationshipStatus', () => {
      const params = new URLSearchParams('?gender=male&relationship-status=single');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('MALE');
      expect(result.relationshipStatus).toBe('SINGLE');
    });
  });

  describe('Special characters and edge cases', () => {
    it('should reject numeric string "123" → "" instead of passing invalid "123" to database', () => {
      const params = new URLSearchParams('?gender=123');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('');
    });
  });

  describe('Random Hypothesis 1: "null" string (THE ORIGINAL BUG)', () => {
    it('should reject "null" → "" instead of passing invalid "NULL" to database', () => {
      const params = new URLSearchParams('?relationship-status=null');
      const result = extractDiscoverParams(params);
      expect(result.relationshipStatus).toBe('');
    });
  });

  describe('Random Hypothesis 2: "0" string - falsy in boolean, truthy in string check', () => {
    it('should reject "0" → "" instead of passing invalid "0" to database', () => {
      const params = new URLSearchParams('?gender=0');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('');
    });
  });

  describe('Random Hypothesis 3: "undefined" string - like "null"', () => {
    it('should reject "undefined" → "" instead of passing invalid "UNDEFINED" to database', () => {
      const params = new URLSearchParams('?relationship-status=undefined');
      const result = extractDiscoverParams(params);
      expect(result.relationshipStatus).toBe('');
    });
  });

  describe('Random Hypothesis 4: Typo in enum "SIGNLE" (misspell SINGLE)', () => {
    it('should reject typo "signle" → "" instead of passing invalid "SIGNLE" to database', () => {
      const params = new URLSearchParams('?relationship-status=signle');
      const result = extractDiscoverParams(params);
      expect(result.relationshipStatus).toBe('');
    });
  });

  describe('Random Hypothesis 6: Reserved word "new" - valid string, invalid enum', () => {
    it('should reject "new" → "" instead of passing invalid "NEW" to database', () => {
      const params = new URLSearchParams('?gender=new');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('');
    });
  });

  describe('Random Hypothesis 7: Random chars "xyz" - looks like nothing', () => {
    it('should reject "xyz" → "" instead of passing invalid "XYZ" to database', () => {
      const params = new URLSearchParams('?gender=xyz');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('');
    });
  });

  describe('Random Hypothesis 8: All digits "123456" - numeric invalid', () => {
    it('should reject "123456" → "" instead of passing invalid "123456" to database', () => {
      const params = new URLSearchParams('?relationship-status=123456');
      const result = extractDiscoverParams(params);
      expect(result.relationshipStatus).toBe('');
    });
  });

  describe('Random Hypothesis 9: "false" string - boolean-like invalid', () => {
    it('should reject "false" → "" instead of passing invalid "FALSE" to database', () => {
      const params = new URLSearchParams('?gender=false');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('');
    });
  });

  describe('Random Hypothesis 10: Hyphenated partial "in-relationship" vs "in_a_relationship"', () => {
    it('should reject "in-relationship" → "" instead of passing invalid "IN_RELATIONSHIP" to database', () => {
      const params = new URLSearchParams('?relationship-status=in-relationship');
      const result = extractDiscoverParams(params);
      expect(result.relationshipStatus).toBe('');
    });
  });

  describe('TRUE-POSITIVE: Truncated enum value', () => {
    it('should reject "ma" (truncated MALE) → "" which prevents 500 error', () => {
      const params = new URLSearchParams('?gender=ma');
      const result = extractDiscoverParams(params);
      expect(result.gender).toBe('');
    });
  });
});
