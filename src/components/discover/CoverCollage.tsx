'use client';

// ============================================================
// CoverCollage — 3-panel editorial split layout
//
// Layout (matches reference sketch):
//   ┌──────────┬───────────┐
//   │          │  cover 2  │
//   │ cover 1  ├───────────┤
//   │          │  cover 3  │
//   └──────────┴───────────┘
//
// cover 1: left column, full height
// cover 2: right column top half
// cover 3: right column bottom half
//
// On hover: covers scale up slightly (zoom-in effect)
// React.memo: prevents re-render when parent hover state changes
// ============================================================

import { memo } from 'react';
import { cn } from '@/lib/utils/cn';
import type { CoverPreview } from '@/types/title';

interface CoverCollageProps {
  covers: CoverPreview[];
  accentColor: string;
  isHovered?: boolean;
  className?: string;
  height?: number; // collage area height in px
}

function CoverCollageInner({
  covers,
  accentColor,
  isHovered = false,
  className,
  height = 200,
}: CoverCollageProps) {
  const [c1, c2, c3] = covers;

  // Transition for zoom-in/out on hover
  const imgTransition = 'transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  const zoomScale = isHovered ? 'scale(1.08)' : 'scale(1)';

  // Fallback gradient tile when no cover image
  const fallbackGradient = (idx: number) => ({
    background: `linear-gradient(135deg, ${accentColor}${['28', '1a', '20'][idx] ?? '18'}, ${accentColor}08)`,
  });

  const imgStyle = (cover?: CoverPreview): React.CSSProperties => ({
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    backgroundColor: cover?.dominantColor ?? '#0f0f18',
    transform: zoomScale,
    transition: imgTransition,
    willChange: 'transform',
  });

  return (
    <div
      className={cn('w-full overflow-hidden', className)}
      style={{ height }}
      aria-hidden="true"
    >
      <div className="grid h-full" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '2px' }}>

        {/* Cover 1 — left column, spans both rows */}
        <div className="overflow-hidden" style={{ gridRow: '1 / span 2' }}>
          {c1 ? (
            <img
              src={`/images/covers/${c1.slug}-320w.avif`}
              alt=""
              loading="lazy"
              decoding="async"
              style={imgStyle(c1)}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                el.parentElement!.style.background = `linear-gradient(135deg, ${accentColor}28, ${accentColor}08)`;
              }}
            />
          ) : (
            <div className="w-full h-full" style={fallbackGradient(0)} />
          )}
        </div>

        {/* Cover 2 — right column, top half */}
        <div className="overflow-hidden" style={{ gridRow: '1', gridColumn: '2' }}>
          {c2 ? (
            <img
              src={`/images/covers/${c2.slug}-320w.avif`}
              alt=""
              loading="lazy"
              decoding="async"
              style={imgStyle(c2)}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                el.parentElement!.style.background = `linear-gradient(135deg, ${accentColor}1a, ${accentColor}06)`;
              }}
            />
          ) : (
            <div className="w-full h-full" style={fallbackGradient(1)} />
          )}
        </div>

        {/* Cover 3 — right column, bottom half */}
        <div className="overflow-hidden" style={{ gridRow: '2', gridColumn: '2' }}>
          {c3 ? (
            <img
              src={`/images/covers/${c3.slug}-320w.avif`}
              alt=""
              loading="lazy"
              decoding="async"
              style={imgStyle(c3)}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                el.parentElement!.style.background = `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`;
              }}
            />
          ) : (
            <div className="w-full h-full" style={fallbackGradient(2)} />
          )}
        </div>

      </div>
    </div>
  );
}

export const CoverCollage = memo(CoverCollageInner);
CoverCollage.displayName = 'CoverCollage';
