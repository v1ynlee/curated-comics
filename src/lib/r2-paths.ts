// ============================================================
// R2 Key Path Builder
// Constructs structured R2 object keys for the media asset bucket.
// All path segments are sanitized to be URL-safe.
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
// ============================================================

import type { AssetType } from '@/types/media';

/**
 * Maps AssetType values to their corresponding R2 bucket path prefixes.
 */
const ASSET_TYPE_PREFIX_MAP: Record<AssetType, string> = {
  cover: 'covers',
  banner: 'banners',
  'article-image': 'articles',
  thumbnail: 'thumbnails',
  'og-asset': 'og-assets',
};

/**
 * Sanitizes a path segment to contain only URL-safe characters.
 * Allows lowercase alphanumeric, hyphens, and underscores.
 * Converts to lowercase, replaces spaces with hyphens, and strips unsafe characters.
 */
export function sanitizePathSegment(segment: string): string {
  return segment
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '');
}

/**
 * Builds a full R2 object key for a media asset variant.
 *
 * Pattern: `{prefix}/{slug}/{contentHash}/{descriptor}.{format}`
 *
 * Examples:
 * - `covers/solo-leveling/a1b2c3d4e5f6/320w.avif`
 * - `banners/tower-of-god/f6e5d4c3b2a1/1920w.webp`
 * - `og-assets/solo-leveling/a1b2c3d4e5f6/og.png`
 */
export function buildR2Key(
  assetType: AssetType,
  slug: string,
  contentHash: string,
  descriptor: string,
  format: string
): string {
  const prefix = ASSET_TYPE_PREFIX_MAP[assetType];
  const safeSlug = sanitizePathSegment(slug);
  const safeHash = sanitizePathSegment(contentHash);
  const safeDescriptor = sanitizePathSegment(descriptor);
  const safeFormat = sanitizePathSegment(format);

  return `${prefix}/${safeSlug}/${safeHash}/${safeDescriptor}.${safeFormat}`;
}

/**
 * Builds an R2 key prefix for listing or deleting all variants of an asset.
 *
 * Pattern: `{prefix}/{slug}/{contentHash}/`
 *
 * Used with ListObjectsV2Command or batch delete operations.
 */
export function buildR2Prefix(
  assetType: AssetType,
  slug: string,
  contentHash: string
): string {
  const prefix = ASSET_TYPE_PREFIX_MAP[assetType];
  const safeSlug = sanitizePathSegment(slug);
  const safeHash = sanitizePathSegment(contentHash);

  return `${prefix}/${safeSlug}/${safeHash}/`;
}
