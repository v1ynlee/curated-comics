// ============================================================
// Per-Title OG Image — dynamic image for each title
// Source of truth: docs/branding/BRANDING_DIRECTION.md
//
// Shows: title name, origin, rating (if available), tier badge.
// ============================================================

import { ImageResponse } from 'next/og';
import { fetchTitle } from '@/services/titles';
import { TIER_CONFIG } from '@/types/title';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TitleOGImage({ params }: Props) {
  const { slug } = await params;
  const title = await fetchTitle(slug).catch(() => null);

  const titleName = title?.titleEnglish ?? 'Comic Curated';
  const origin = title?.origin ?? '';
  const rating = title?.ratings?.overall;
  const tier = title?.tier;
  const tierConfig = tier ? TIER_CONFIG[tier] : null;
  const dominantColor = title?.coverImage?.dominantColor ?? '#1a1a2e';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: `linear-gradient(135deg, ${dominantColor} 0%, #08080f 60%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(8,8,15,0.7) 0%, rgba(8,8,15,0.95) 100%)',
          }}
        />

        {/* Accent orb from dominant color */}
        <div
          style={{
            position: 'absolute',
            left: '5%',
            top: '10%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${dominantColor}30 0%, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '60px 80px',
            width: '100%',
            height: '100%',
            gap: 16,
          }}
        >
          {/* Site label */}
          <span
            style={{
              fontFamily: 'sans-serif',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#6b6b80',
              marginBottom: 8,
            }}
          >
            Comic Curated
          </span>

          {/* Title */}
          <div
            style={{
              fontFamily: 'serif',
              fontSize: titleName.length > 30 ? 52 : titleName.length > 20 ? 64 : 80,
              fontWeight: 900,
              lineHeight: 1.1,
              color: '#f0f0f5',
              maxWidth: 900,
            }}
          >
            {titleName}
          </div>

          {/* Meta row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginTop: 8,
            }}
          >
            {/* Origin */}
            {origin && (
              <span
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#a0a0b8',
                }}
              >
                {origin}
              </span>
            )}

            {/* Rating */}
            {rating !== undefined && (
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#8b5cf6',
                }}
              >
                {rating % 1 === 0 ? rating.toString() : rating.toFixed(1)} / 10
              </span>
            )}

            {/* Tier badge */}
            {tierConfig && (
              <span
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: tierConfig.color,
                  padding: '4px 10px',
                  border: `1px solid ${tierConfig.color}60`,
                  borderRadius: 2,
                  background: `${tierConfig.color}15`,
                }}
              >
                {tier} — {tierConfig.label}
              </span>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #ec4899)',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
