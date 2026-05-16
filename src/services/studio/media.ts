// ============================================================
// Media Service — Supabase queries for media assets
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
//
// Provides functions to query media_assets table and resolve
// image URLs — either from CDN (R2) or local filesystem fallback.
// ============================================================

import { supabase } from '../api';
import type { AssetType, MediaAsset, MediaVariant } from '@/types/media';

// ── Row shape returned by Supabase ────────────────────────────

interface MediaAssetRow {
  id: string;
  slug: string;
  asset_type: string;
  content_hash: string;
  original_width: number;
  original_height: number;
  aspect_ratio: number;
  mime_type: string;
  dominant_color: string;
  blur_data_uri: string;
  variants: MediaVariant[];
  r2_base_path: string;
  created_at: string;
  updated_at: string;
}

// ── Mapper ────────────────────────────────────────────────────

function mapMediaAsset(row: MediaAssetRow): MediaAsset {
  return {
    id: row.id,
    slug: row.slug,
    assetType: row.asset_type as AssetType,
    contentHash: row.content_hash,
    originalWidth: row.original_width,
    originalHeight: row.original_height,
    aspectRatio: row.aspect_ratio,
    mimeType: row.mime_type,
    dominantColor: row.dominant_color,
    blurDataUri: row.blur_data_uri,
    variants: row.variants ?? [],
    r2BasePath: row.r2_base_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Public API ────────────────────────────────────────────────

/**
 * Fetch a single media asset by slug and asset type.
 * Returns null if no matching row exists.
 */
export async function fetchMediaAsset(
  slug: string,
  assetType: AssetType,
): Promise<MediaAsset | null> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('slug', slug)
    .eq('asset_type', assetType)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`fetchMediaAsset: ${error.message}`);
  }

  if (!data) return null;

  return mapMediaAsset(data as unknown as MediaAssetRow);
}

/**
 * Fetch all media variants for a given slug (across all asset types).
 * Returns a flat array of variant objects with width, format, url, and size.
 */
export async function fetchMediaVariants(slug: string): Promise<MediaVariant[]> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('variants')
    .eq('slug', slug);

  if (error) {
    throw new Error(`fetchMediaVariants: ${error.message}`);
  }

  if (!data || data.length === 0) return [];

  // Flatten variants from all matching rows
  const allVariants: MediaVariant[] = [];
  for (const row of data) {
    const variants = (row as { variants: MediaVariant[] }).variants;
    if (Array.isArray(variants)) {
      allVariants.push(...variants);
    }
  }

  return allVariants;
}

/**
 * Resolve the image URL for a given slug, width, and format.
 *
 * Resolution logic:
 * 1. Query media_assets for the slug (cover type by default)
 * 2. If found, search the variants JSONB array for a matching width and format
 * 3. Return the CDN URL from the matching variant
 * 4. If no media_assets row exists, fall back to local path:
 *    /images/covers/{slug}-{width}w.{format}
 */
export async function getImageUrl(
  slug: string,
  width: number,
  format: 'avif' | 'webp',
): Promise<string> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('variants')
    .eq('slug', slug)
    .eq('asset_type', 'cover')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`getImageUrl: ${error.message}`);
  }

  // If a media_assets row exists, look for a matching variant
  if (data) {
    const variants = (data as { variants: MediaVariant[] }).variants;
    if (Array.isArray(variants)) {
      const match = variants.find(
        (v) => v.width === width && v.format === format,
      );
      if (match) {
        return match.url;
      }
    }
  }

  // Fall back to local filesystem path
  return `/images/covers/${slug}-${width}w.${format}`;
}
