import 'server-only';

import sharp from 'sharp';

const PHOTO_CONSTRAINTS = {
  profilePhoto: { width: 400, height: 400 },
  coverPhoto: { width: 800, height: 400 },
} as const;

/**
 * Resizes and crops a photo to the max dimensions for the given type.
 * - If the image aspect ratio differs from the target, crops to center.
 * - If the image is larger than the target, shrinks while maintaining aspect ratio.
 * - If the image is already within bounds, no enlargement occurs.
 * - Always outputs JPEG at 85% quality to reduce file size.
 */
export async function resizePhoto(
  buffer: Buffer,
  toUpdate: 'profilePhoto' | 'coverPhoto',
): Promise<{ buffer: Buffer; mimeType: 'image/jpeg'; extension: 'jpg' }> {
  const { width, height } = PHOTO_CONSTRAINTS[toUpdate];
  const resized = await sharp(buffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'centre',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();

  return { buffer: resized, mimeType: 'image/jpeg', extension: 'jpg' };
}
