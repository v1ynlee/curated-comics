'use client';

// ============================================================
// PageHeading — shared page-level h1 using Child Hood font
//
// Font: Child Hood (local, src/fonts/Child-Hood/Child Hood.woff2)
//       loaded via next/font/local → CSS var --font-child-hood
//       mapped to --font-page-heading in global.css.
//
// Styling:
//   Uses semantic variables for perfect light/dark theme sync.
//   Applies a subtle text gradient masking for a cinematic, 
//   metallic sheen rather than a flat, boring color.
// ============================================================

import { cn } from '@/lib/utils/cn';

interface PageHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function PageHeading({ children, className }: PageHeadingProps) {
  return (
    <div className="relative inline-block">
      {/* Subtle under-glow. 
        Uses text-primary color but blurred, adapting automatically to light/dark.
      */}
      <div 
        className="absolute inset-0 blur-[24px] opacity-20 -z-10 bg-text-primary pointer-events-none" 
        aria-hidden="true"
      />
      
      <h1
        className={cn(
          'relative z-10 leading-[1.05] tracking-[-0.02em]',
          // The text color is transparent because we are using a background clip below
          'text-transparent bg-clip-text',
          // A subtle gradient that adapts to light/dark. 
          // In dark mode: white -> off-white -> gray. 
          // In light mode: black -> dark-gray -> gray.
          'bg-gradient-to-br from-text-primary via-text-primary to-text-tertiary',
          className
        )}
        style={{
          fontFamily: 'var(--font-page-heading)',
          fontSize: 'clamp(3rem, 7vw, 4.5rem)',
          fontWeight: 400, // Child Hood's natural weight
        }}
      >
        {children}
      </h1>
    </div>
  );
}