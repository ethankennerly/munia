import { imageSize } from 'image-size';

const MAX_DIMENSION = 4096;

export function validateImageDimensions(buffer: Buffer): { ok: true } | { ok: false; error: string } {
  try {
    const result = imageSize(new Uint8Array(buffer));
    const w = result.width;
    const h = result.height;
    if (w == null || h == null) return { ok: true };
    if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
      return {
        ok: false,
        error: `Image is too large. Maximum dimensions ${MAX_DIMENSION}×${MAX_DIMENSION}.`,
      };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}
