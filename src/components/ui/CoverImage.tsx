'use client';

// ============================================================
// CoverImage — blur-up image loading with flag + tier badge
//
// Supports two image sources:
// 1. R2/CDN: When `mediaAsset` prop is provided, builds srcset from CDN variants
// 2. Local: Falls back to local filesystem paths (/images/covers/{slug}-{width}w.avif)
//
// Top-right:    SVG country flag (kr/jp/cn) based on origin
// Bottom-right: Tier badge
// ============================================================

import { useState } from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils/cn';
import { TIER_CONFIG } from '@/types/title';
import type { Origin, TierLevel } from '@/types/title';
import type { MediaAsset } from '@/types/media';

// Map origin → flag SVG path
const FLAG_MAP: Record<Origin, string> = {
  manhwa: '/icons/kr.svg',
  manga:  '/icons/jp.svg',
  manhua: '/icons/cn.svg',
};

interface CoverImageProps {
  slug: string;
  alt: string;
  blurDataURL?: string;
  dominantColor?: string;
  aspectRatio?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  /** Show origin flag in top-right corner */
  origin?: Origin;
  /** Show tier badge in bottom-right corner */
  tier?: TierLevel;
  /** Apply rounded corners (for small thumbnails) */
  rounded?: boolean;
  /** R2 media asset — when provided, uses CDN URLs from variants */
  mediaAsset?: MediaAsset;
}

/**
 * Build srcset string from MediaAsset variants for a given format.
 * Returns entries like "https://cdn.example.com/.../320w.avif 320w, ..."
 */
function buildSrcSet(variants: MediaAsset['variants'], format: 'avif' | 'webp'): string {
  return variants
    .filter((v) => v.format === format)
    .sort((a, b) => a.width - b.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(', ');
}

export function CoverImage({
  slug,
  alt,
  blurDataURL,
  dominantColor = '#1a1a2e',
  aspectRatio = 2 / 3,
  priority = false,
  className,
  sizes = '(max-width: 768px) 50vw, 33vw',
  origin,
  tier,
  rounded = false,
  mediaAsset,
}: CoverImageProps) {
  const [loaded, setLoaded] = useState(false);
  const tierConfig = tier ? TIER_CONFIG[tier] : null;

  // Resolve blur, dominant color, and aspect ratio from mediaAsset if available
  const resolvedBlur = mediaAsset?.blurDataUri ?? blurDataURL;
  const resolvedColor = mediaAsset?.dominantColor ?? dominantColor;
  const resolvedAspectRatio = mediaAsset
    ? mediaAsset.originalWidth / mediaAsset.originalHeight
    : aspectRatio;

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        rounded && 'rounded-lg',
        className,
      )}
      style={{
        aspectRatio: `${resolvedAspectRatio}`,
        backgroundColor: resolvedColor,
      }}
    >
      {/* Blur placeholder */}
      {resolvedBlur && (
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 scale-110 blur-xl transition-opacity duration-700',
            loaded ? 'opacity-0' : 'opacity-100',
          )}
          style={{
            backgroundImage: `url(${resolvedBlur})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Full image — R2/CDN path or local fallback */}
      {mediaAsset ? (
        <picture
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        >
          {/* AVIF sources (preferred) */}
          <source
            type="image/avif"
            srcSet={buildSrcSet(mediaAsset.variants, 'avif')}
            sizes={sizes}
          />
          {/* WebP fallback */}
          <source
            type="image/webp"
            srcSet={buildSrcSet(mediaAsset.variants, 'webp')}
            sizes={sizes}
          />
          {/* Fallback img element */}
          <img
            src={
              mediaAsset.variants.find((v) => v.format === 'webp' && v.width === 640)?.url ??
              mediaAsset.variants.find((v) => v.format === 'webp')?.url ??
              mediaAsset.variants[0]?.url ??
              `/images/covers/${slug}-640w.avif`
            }
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setLoaded(true)}
            className="w-full h-full object-cover"
            sizes={sizes}
          />
        </picture>
      ) : (
        <NextImage
          src={`/images/covers/${slug}-640w.avif`}
          alt={alt}
          fill
          className={cn(
            'object-cover transition-opacity duration-700',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setLoaded(true)}
          priority={priority}
          sizes={sizes}
        />
      )}

      {/* ── Flag — top-right ─────────────────────────────────── */}
      {origin && (
        <div
          className="absolute top-1.5 right-1.5 w-5 h-auto overflow-hidden rounded-sm shadow-sm"
          aria-label={origin}
          title={origin === 'manhwa' ? 'Korean Manhwa' : origin === 'manga' ? 'Japanese Manga' : 'Chinese Manhua'}
        >
          <NextImage
            src={FLAG_MAP[origin]}
            alt={origin}
            width={20}
            height={14}
            className="w-full h-auto"
            unoptimized
          />
        </div>
      )}

      {/* ── Tier badge — bottom-right ────────────────────────── */}
      {tierConfig && (
        <span
          className="absolute bottom-1.5 right-1.5 font-heading text-[9px] font-bold px-1 py-0.5 rounded-sm leading-none"
          style={{
            color: tierConfig.color,
            backgroundColor: `${tierConfig.color}25`,
            border: `1px solid ${tierConfig.color}50`,
            backdropFilter: 'blur(4px)',
          }}
          aria-label={`Tier ${tier}`}
        >
          {tier}
        </span>
      )}
    </div>
  );
}
