import 'server-only';
import prisma from '@/lib/prisma/prisma';

/**
 * Generates a unique username from a user's name.
 * Format: {firstName}{lastName} or {firstName}{lastName}_{numDuplicateNames}
 * Example: "Ethan Kennerly" -> "ethankennerly" or "ethankennerly_2" if taken
 */
export async function generateUniqueUsername(name: string | null | undefined): Promise<string | undefined> {
  if (!name) {
    return undefined;
  }

  // Normalize the name: convert to lowercase and handle accented characters
  let normalized = name
    .trim()
    .toLowerCase()
    // Normalize accented characters to their base equivalents (é → e, ñ → n, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics

  // Convert common separators and invalid characters:
  // - Spaces: remove (they separate name parts)
  // - Hyphens, underscores: keep as is (but we'll convert hyphens to underscores later)
  // - Periods, apostrophes, commas: remove
  // - Other special chars: remove
  normalized = normalized
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/-/g, '_') // Convert hyphens to underscores
    .replace(/['"`.,;:!?@#$%^&*()+=[\]{}|\\/<>~`]/g, ''); // Remove other punctuation and special chars

  // Keep only alphanumeric and underscores (final cleanup)
  const baseUsername = normalized.replace(/[^a-z0-9_]/g, '');

  // Validate: username must be at least 3 characters and start with a letter
  // If it doesn't meet requirements, return undefined (form will use fallback)
  if (!baseUsername || baseUsername.length < 3 || !/^[a-z]/.test(baseUsername)) {
    return undefined;
  }

  // Check if base username exists
  const existingUser = await prisma.user.findUnique({
    where: { username: baseUsername },
    select: { id: true },
  });

  if (!existingUser) {
    return baseUsername;
  }

  // If exists, try with suffix _2, _3, etc.
  let suffix = 2;
  let candidateUsername: string;

  while (true) {
    candidateUsername = `${baseUsername}_${suffix}`;

    const existingUserWithSuffix = await prisma.user.findUnique({
      where: { username: candidateUsername },
      select: { id: true },
    });

    if (!existingUserWithSuffix) {
      return candidateUsername;
    }

    suffix++;
    // Safety check to prevent infinite loop
    if (suffix > 10000) {
      throw new Error('Unable to generate unique username: too many duplicates');
    }
  }
}
