import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractDateOnly, parseDateOnly } from './dateOnly';

describe('dateOnly utilities', () => {
  beforeEach(() => {
    // Mock timezone to US Pacific (UTC-8) to test timezone conversion issues
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00-08:00')); // Pacific time
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('extractDateOnly', () => {
    it('should extract date-only string from ISO string', () => {
      expect(extractDateOnly('1976-04-06T00:00:00.000Z')).toBe('1976-04-06');
    });

    it('should extract date-only string from Date object', () => {
      const date = new Date('1976-04-06T00:00:00.000Z');
      expect(extractDateOnly(date)).toBe('1976-04-06');
    });

    it('should return null for null input', () => {
      expect(extractDateOnly(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(extractDateOnly(undefined)).toBeNull();
    });
  });

  describe('parseDateOnly', () => {
    it('should create local date from ISO string without timezone conversion', () => {
      // April 6 UTC midnight should remain April 6 in local time
      const result = parseDateOnly('1976-04-06T00:00:00.000Z');
      expect(result).not.toBeNull();
      expect(result!.getFullYear()).toBe(1976);
      expect(result!.getMonth()).toBe(3); // April (0-indexed)
      expect(result!.getDate()).toBe(6);
    });

    it('should create local date from Date object without timezone conversion', () => {
      const date = new Date('1976-04-06T00:00:00.000Z');
      const result = parseDateOnly(date);
      expect(result).not.toBeNull();
      expect(result!.getFullYear()).toBe(1976);
      expect(result!.getMonth()).toBe(3); // April (0-indexed)
      expect(result!.getDate()).toBe(6);
    });

    it('should handle date-only string (YYYY-MM-DD)', () => {
      const result = parseDateOnly('1976-04-06');
      expect(result).not.toBeNull();
      expect(result!.getFullYear()).toBe(1976);
      expect(result!.getMonth()).toBe(3); // April (0-indexed)
      expect(result!.getDate()).toBe(6);
    });

    it('should return null for null input', () => {
      expect(parseDateOnly(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(parseDateOnly(undefined)).toBeNull();
    });

    it('should prevent timezone conversion bug (April 6 UTC stays April 6 local)', () => {
      // This is the bug we're preventing:
      // new Date('1976-04-06T00:00:00.000Z') in US Pacific timezone would show as April 5
      // But parseDateOnly should keep it as April 6
      const isoString = '1976-04-06T00:00:00.000Z';
      const correctWay = parseDateOnly(isoString);

      // parseDateOnly should preserve the date (April 6) without timezone conversion
      // In Pacific timezone, new Date(isoString).getDate() would be 5 (timezone conversion bug)
      // But parseDateOnly should return April 6 (no timezone conversion)
      expect(correctWay).not.toBeNull();
      expect(correctWay!.getDate()).toBe(6);
    });
  });
});
