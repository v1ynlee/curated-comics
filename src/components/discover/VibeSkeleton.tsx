'use client';

// ============================================================
// VibeCardSkeleton / VibeGridSkeleton
// Cinematic loading states matching exact VibeCard layout.
// Uses existing Skeleton component (animate-shimmer).
// ============================================================

import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

type SkeletonVariant = 'featured' | 'medium' | 'compact';

interface VibeCardSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

// Mirror the height values from VibeCard
const CARD_HEIGHT: Record<SkeletonVariant, string> = {
  featured: 'h-[320px]',
  medium:   'h-[240px]',
  compact:  'h-[200px]',
};

// Number of collage cover skeleton rects per variant
const COLLAGE_COUNT: Record<SkeletonVariant, number> = {
  featured: 5,
  medium:   3,
  compact:  2,
};

// Collage cover positions mirroring CoverCollage slot layouts
const COLLAGE_SKELETONS_FEATURED = [
  { w: 90,  h: 135, rotate:  0,   tx: '50%',   left: '50%'  },
  { w: 90,  h: 135, rotate: -7,   tx: '-2px',  left: '22%'  },
  { w: 90,  h: 135, rotate:  5,   tx: '-2px',  left: '62%'  },
  { w: 90,  h: 135, rotate: -4,   tx: '-2px',  left: '5%'   },
  { w: 90,  h: 135, rotate:  8,   tx: '-2px',  left: '78%'  },
];

const COLLAGE_SKELETONS_MEDIUM = [
  { w: 70,  h: 105, rotate:  0,   left: '50%', mx: '-35px'  },
  { w: 70,  h: 105, rotate: -6,   left: '22%', mx: '0px'    },
  { w: 70,  h: 105, rotate:  5,   left: '62%', mx: '0px'    },
];

const COLLAGE_SKELETONS_COMPACT = [
  { w: 56,  h: 84,  rotate:  0,   left: '50%', mx: '-28px'  },
  { w: 56,  h: 84,  rotate: -5,   left: '25%', mx: '0px'    },
];

export function VibeCardSkeleton({ variant = 'medium', className }: VibeCardSkeletonProps) {
  const isFeatured = variant === 'featured';
  const isCompact  = variant === 'compact';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl flex-shrink-0',
        CARD_HEIGHT[variant],
        isFeatured ? 'w-[480px]' : isCompact ? 'w-[220px]' : 'w-[280px]',
        className,
      )}
      aria-hidden="true"
    >
      {/* Atmospheric tinted background */}
      <div className="absolute inset-0 bg-surface-elevated animate-shimmer" />
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: 'linear-gradient(135deg, #8b5cf620, #6d28d910)' }}
      />

      {/* Collage area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: isFeatured ? 260 : isCompact ? 160 : 200, height: isFeatured ? 155 : 115 }}>
          {(isFeatured ? COLLAGE_SKELETONS_FEATURED : isCompact ? COLLAGE_SKELETONS_COMPACT : COLLAGE_SKELETONS_MEDIUM)
            .map((s, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width:      s.w,
                  height:     s.h,
                  left:       s.left ?? '0',
                  marginLeft: (s as { mx?: string }).mx ?? '0',
                  transform:  `rotate(${s.rotate}deg)`,
                  zIndex:     COLLAGE_COUNT[variant] - i,
                }}
              >
                <Skeleton className="w-full h-full rounded-sm shadow-md" />
              </div>
            ))}
        </div>
      </div>

      {/* Badge skeleton — top left */}
      <div className="absolute top-3 left-3">
        <Skeleton className="h-[18px] w-[52px] rounded-[2px]" />
      </div>

      {/* Icon skeleton — top right */}
      <div className="absolute top-3 right-3">
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      {/* Bottom gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[45%]"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}
      />

      {/* Text area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
        {/* Mood name */}
        <Skeleton className={cn('h-5 rounded-sm', isFeatured ? 'w-[180px]' : 'w-[120px]')} />
        {/* Editor note — featured + medium only */}
        {!isCompact && (
          <Skeleton className={cn('h-3 rounded-sm', isFeatured ? 'w-[240px]' : 'w-[150px]')} />
        )}
        {/* Metadata bar */}
        <Skeleton className="h-3 w-[100px] rounded-sm" />
      </div>
    </div>
  );
}

// ── Full grid skeleton ────────────────────────────────────────

interface VibeGridSkeletonProps {
  className?: string;
}

export function VibeGridSkeleton({ className }: VibeGridSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Control bar skeleton */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2">
          {[80, 110, 90, 100, 70, 85].map((w, i) => (
            <div key={i} style={{ width: w }}>
              <Skeleton className="h-7 w-full rounded-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-5 w-[120px] rounded-sm" />
      </div>

      {/* Card scroll track skeleton */}
      <div
        className="flex gap-4 overflow-hidden px-6 py-2"
        aria-label="Loading vibes..."
      >
        <VibeCardSkeleton variant="featured" />
        <VibeCardSkeleton variant="medium" />
        <VibeCardSkeleton variant="compact" />
        <VibeCardSkeleton variant="medium" />
        <VibeCardSkeleton variant="compact" />
        <VibeCardSkeleton variant="medium" />
      </div>
    </div>
  );
}
