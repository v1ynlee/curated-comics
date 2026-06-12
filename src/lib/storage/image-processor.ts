// ============================================================
// Image Processor
// Sharp-based image processing pipeline for media assets.
// Handles content hashing, upload validation, responsive variant
// generation, LQIP blur placeholders, and dominant color extraction.
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
// ============================================================

import { createHash } from 'crypto';
import sharp from 'sharp';
import type { AssetType, ProcessedVariant, ProcessingResult } from '@/types/media';

// Width constants per asset type
export const COVER_WIDTHS = [320, 480, 640, 1200];
export const BANNER_WIDTHS = [768, 1200, 1920];
export const ARTICLE_WIDTHS = [480, 768, 1200];

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Generates a content hash (SHA-256) of the given buffer,
 * truncated to 12 hex characters.
 */
export function generateContentHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 12);
}

/**
 * Validates an upload file against allowed MIME types and max size.
 * Returns { valid: true } if acceptable, or { valid: false, error: string } otherwise.
 */
export function validateUpload(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIMES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid MIME type: ${file.type}. Allowed: ${ALLOWED_MIMES.join(', ')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum 10MB`,
    };
  }

  return { valid: true };
}

/**
 * Returns the target widths for a given asset type.
 */
function getWidthsForAssetType(assetType: AssetType): number[] {
  switch (assetType) {
    case 'cover':
    case 'thumbnail':
    case 'title_cover':
    case 'creator_image':
    case 'gallery_image':
    case 'character_image':
      return COVER_WIDTHS;
    case 'banner':
    case 'og-asset':
      return BANNER_WIDTHS;
    case 'article-image':
    case 'article_cover':
      return ARTICLE_WIDTHS;
    default:
      return COVER_WIDTHS;
  }
}

/**
 * Processes an image buffer into responsive variants, LQIP, and metadata.
 *
 * For each target width (determined by assetType), generates both AVIF (quality 65)
 * and WebP (quality 75) variants. Also produces a low-quality image placeholder (LQIP)
 * at 20px width with Gaussian blur sigma 3, JPEG quality 30, encoded as a base64 data URI.
 * Extracts dominant color hex and original dimensions/aspect ratio.
 */
export async function processImage(
  buffer: Buffer,
  assetType: AssetType
): Promise<ProcessingResult> {
  const contentHash = generateContentHash(buffer);
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const originalWidth = metadata.width!;
  const originalHeight = metadata.height!;
  const aspectRatio = originalWidth / originalHeight;
  const mimeType = `image/${metadata.format}`;

  const widths = getWidthsForAssetType(assetType);

  // Generate responsive variants (AVIF + WebP for each width)
  const variants: ProcessedVariant[] = [];

  for (const width of widths) {
    // Only resize if the target width is smaller than or equal to the original
    const targetWidth = Math.min(width, originalWidth);

    const [avifBuffer, webpBuffer] = await Promise.all([
      sharp(buffer)
        .resize(targetWidth, null, { withoutEnlargement: true })
        .avif({ quality: 65 })
        .toBuffer(),
      sharp(buffer)
        .resize(targetWidth, null, { withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer(),
    ]);

    variants.push({
      width: targetWidth,
      format: 'avif',
      buffer: avifBuffer,
      size: avifBuffer.length,
    });

    variants.push({
      width: targetWidth,
      format: 'webp',
      buffer: webpBuffer,
      size: webpBuffer.length,
    });
  }

  // Generate LQIP: 20px width, Gaussian blur sigma 3, JPEG quality 30, base64 data URI
  const lqipBuffer = await sharp(buffer)
    .resize(20, null, { withoutEnlargement: true })
    .blur(3)
    .jpeg({ quality: 30 })
    .toBuffer();

  const blurDataUri = `data:image/jpeg;base64,${lqipBuffer.toString('base64')}`;

  // Extract dominant color via Sharp stats
  const stats = await sharp(buffer).stats();
  const dominant = stats.dominant;
  const dominantColor = `#${componentToHex(dominant.r)}${componentToHex(dominant.g)}${componentToHex(dominant.b)}`;

  return {
    contentHash,
    variants,
    blurDataUri,
    dominantColor,
    originalWidth,
    originalHeight,
    aspectRatio,
    mimeType,
  };
}

/**
 * Converts a single color component (0-255) to a 2-character hex string.
 */
function componentToHex(c: number): string {
  const hex = Math.round(c).toString(16).padStart(2, '0');
  return hex;
}
