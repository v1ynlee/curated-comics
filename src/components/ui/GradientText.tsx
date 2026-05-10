// ============================================================
// GradientText — gradient-filled text
// Source of truth: docs/design/TYPOGRAPHY_SYSTEM.md
// ============================================================

import { cn } from '@/lib/cn';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  /** Tailwind gradient classes or custom style */
  gradient?: string;
}

export function GradientText({
  children,
  className,
  gradient,
}: GradientTextProps) {
  return (
    <span
      className={cn(
        'bg-clip-text text-transparent',
        gradient ?? 'bg-gradient-to-r from-accent-primary to-accent-quaternary',
        className,
      )}
    >
      {children}
    </span>
  );
}
