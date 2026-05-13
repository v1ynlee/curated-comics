'use client';

// ============================================================
// PageHeading — shared page-level h1 using Child Hood font
//
// Font: Child Hood (local, src/fonts/Child-Hood/Child Hood.woff2)
//       loaded via next/font/local → CSS var --font-child-hood
//       mapped to --font-page-heading in @theme inline.
//
// Colors — soft, balanced, never pure black or pure white:
//   Dark theme:  #dcdcf0  — soft lavender-white
//   Light theme: #2a2a40  — deep charcoal-navy, not harsh black
//
// The heading-glow animation is preserved from globals.css.
// ============================================================

import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/cn';

interface PageHeadingProps {
  children: React.ReactNode;
  className?: string;
  /** Override the soft color with a custom value */
  color?: string;
}

// Soft heading colors — theme-aware, never pure black/white
const HEADING_COLOR = {
  dark:  '#dcdcf0',  // soft lavender-white — warm, not harsh
  light: '#2a2a40',  // deep charcoal-navy — readable, not pure black
} as const;

export function PageHeading({ children, className, color }: PageHeadingProps) {
  const theme = useUIStore((s) => s.theme);
  const headingColor = color ?? HEADING_COLOR[theme];

  return (
    <h1
      className={cn('heading-glow leading-tight', className)}
      style={{
        fontFamily: 'var(--font-page-heading)',
        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        fontWeight: 400,   // Child Hood is a display face — 400 is its natural weight
        color: headingColor,
        lineHeight: 1.1,
      }}
    >
      {children}
    </h1>
  );
}
