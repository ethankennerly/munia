/**
 * Utility functions for handling date-only values (YYYY-MM-DD) without timezone conversion issues.
 *
 * When dates are stored in the database as UTC timestamps (e.g., "1976-04-06T00:00:00.000Z"),
 * parsing them with `new Date()` and then formatting can cause timezone conversion issues.
 * For example, April 6 UTC midnight becomes April 5 in US timezones.
 *
 * These utilities extract just the date part (YYYY-MM-DD) and create local dates,
 * avoiding timezone conversion for date-only values.
 */

/**
 * Extracts the date-only part (YYYY-MM-DD) from a Date object or ISO string.
 * @param date - Date object or ISO string (e.g., "1976-04-06T00:00:00.000Z")
 * @returns Date-only string (e.g., "1976-04-06")
 */
export function extractDateOnly(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const dateStr = typeof date === 'string' ? date : date.toISOString();
  return dateStr.split('T')[0];
}

/**
 * Creates a local Date object from a date-only string or Date/ISO string.
 * Avoids timezone conversion by parsing YYYY-MM-DD directly.
 * @param date - Date object, ISO string, or date-only string (YYYY-MM-DD)
 * @returns Local Date object with time set to midnight local time
 */
export function parseDateOnly(date: Date | string | null | undefined): Date | null {
  const dateOnly = extractDateOnly(date);
  if (!dateOnly) return null;

  const [year, month, day] = dateOnly.split('-').map(Number);
  // Create date in local timezone (month is 0-indexed)
  return new Date(year, month - 1, day);
}
