// ============================================================
// Default OG Image — site-wide fallback
// Source of truth: docs/branding/BRANDING_DIRECTION.md
//
// Generated at build time via Next.js ImageResponse.
// Size: 1200×630 (standard OG image dimensions).
// ============================================================

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Comic Curated — A cinematic personal comic-reading showcase';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #08080f 0%, #0f0f1a 50%, #1a1a2e 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent orbs */}
        <div
          style={{
            position: 'absolute',
            left: '20%',
            top: '30%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '20%',
            bottom: '20%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            zIndex: 1,
          }}
        >
          {/* Label */}
          <span
            style={{
              fontFamily: 'sans-serif',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#6b6b80',
            }}
          >
            Personal Reading Archive
          </span>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Comic
            </span>
            <span style={{ color: '#f0f0f5', marginLeft: 24 }}>Curated</span>
          </div>

          {/* Subtitle */}
          <span
            style={{
              fontFamily: 'sans-serif',
              fontSize: 22,
              fontWeight: 300,
              color: '#a0a0b8',
              marginTop: 8,
            }}
          >
            Korean manhwa · Chinese manhua · Japanese manga
          </span>
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
