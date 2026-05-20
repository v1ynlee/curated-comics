// ============================================================
// GradientText → AccentText — solid accent color
// Gradient text (background-clip: text) is banned.
// Uses a single vivid accent color for emphasis instead.
// Source of truth: docs/design/TYPOGRAPHY_SYSTEM.md
// ============================================================

import { cn } from '@/lib/utils/cn';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  /** Tailwind gradient classes — DEPRECATED, ignored. Kept for API compat. */
  gradient?: string;
}

export function GradientText({
  children,
  className,
}: GradientTextProps) {
  return (
    <span
      className={cn(
        'text-accent-primary',
        className,
      )}
    >
      {children}
    </span>
  );
}
