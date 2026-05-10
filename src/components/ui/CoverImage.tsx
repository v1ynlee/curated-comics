'use client';

// ============================================================
// CoverImage — blur-up image loading component
// Source of truth: docs/motion/ANIMATION_GUIDELINES.md — Rule 7
//                  docs/performance/IMAGE_PIPELINE.md
// ============================================================

import { useState } from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/cn';

interface CoverImageProps {
  slug: string;
  alt: string;
  blurDataURL?: string;
  dominantColor?: string;
  aspectRatio?: number; // width/height, default 2/3
  priority?: boolean;
  className?: string;
  sizes?: string;
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
}: CoverImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
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
    </div>
  );
}
