'use client';

// ============================================================
// CoverImage — blur-up image loading with flag + tier badge
//
// Top-right:    SVG country flag (kr/jp/cn) based on origin
// Bottom-right: Tier badge (moved from top-right)
// ============================================================

import { useState } from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/cn';
import { TIER_CONFIG } from '@/types/title';
import type { Origin, TierLevel } from '@/types/title';

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
}: CoverImageProps) {
  const [loaded, setLoaded] = useState(false);
  const tierConfig = tier ? TIER_CONFIG[tier] : null;

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        rounded && 'rounded-lg',
        className,
      )}
      style={{
        aspectRatio: `${aspectRatio}`,
        backgroundColor: dominantColor,
      }}
    >
      {/* Blur placeholder */}
      {blurDataURL && (
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 scale-110 blur-xl transition-opacity duration-700',
            loaded ? 'opacity-0' : 'opacity-100',
          )}
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Full image */}
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
