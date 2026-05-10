// ============================================================
// Landing Page — Phase 0 Placeholder
// Full cinematic hero is Phase 1. This page validates that
// the design system, fonts, and CSS variables are working.
// ============================================================

import { GradientText } from '@/components/ui/GradientText';

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg-deep">
      {/* Ambient background gradient */}
      <div
        aria-hidden="true"
        className="particle-field pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-bg-deep via-bg-mid to-bg-surface opacity-80" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-primary opacity-5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-accent-quaternary opacity-5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="container-content flex flex-col items-center gap-8 text-center">
        {/* Label */}
        <span className="font-heading text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
          Phase 0 — Foundation
        </span>

        {/* Title */}
        <h1 className="font-display text-6xl font-black leading-none tracking-tight md:text-8xl">
          <GradientText>Comic Curated</GradientText>
        </h1>

        {/* Tagline */}
        <p className="max-w-md font-body text-lg font-light text-text-secondary md:text-xl">
          A cinematic personal comic-reading showcase.
          <br />
          <span className="text-text-tertiary text-base">
            Korean manhwa · Chinese manhua · Japanese manga
          </span>
        </p>

        {/* Design system validation */}
        <div className="mt-8 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
          {[
            { label: 'DM Sans', className: 'font-body', sample: 'Body text' },
            { label: 'Playfair', className: 'font-display', sample: 'Display' },
            { label: 'JetBrains', className: 'font-data', sample: '8.5 / 10' },
            { label: 'Caveat', className: 'font-accent', sample: 'Personal note' },
          ].map(({ label, className, sample }) => (
            <div
              key={label}
              className="rounded-sm border border-white/10 bg-surface-elevated/50 px-4 py-3"
            >
              <p className="font-data text-xs text-text-tertiary">{label}</p>
              <p className={`mt-1 text-base text-text-primary ${className}`}>
                {sample}
              </p>
            </div>
          ))}
        </div>

        {/* Color palette */}
        <div className="flex gap-2">
          {[
            'bg-accent-primary',
            'bg-accent-secondary',
            'bg-accent-tertiary',
            'bg-accent-quaternary',
            'bg-semantic-success',
            'bg-semantic-danger',
          ].map((color) => (
            <div
              key={color}
              className={`h-6 w-6 rounded-full ${color}`}
              title={color}
              aria-label={color}
            />
          ))}
        </div>

        {/* Status */}
        <p className="font-data text-xs text-text-tertiary">
          Design system ✓ · Fonts ✓ · CSS variables ✓ · Providers ✓
        </p>
      </div>
    </div>
  );
}
