'use client';

// ============================================================
// ScheduledCountdown — real-time countdown for scheduled articles
// Displays "Publishes in Xh Ym" for articles in 'scheduled' state.
// Updates every minute. Uses semantic-warning design token.
// Respects prefers-reduced-motion (no pulse animation).
// ============================================================

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

// ── Types ─────────────────────────────────────────────────────

interface ScheduledCountdownProps {
  /** ISO 8601 date string for the scheduled publish time */
  scheduledDate: string;
  /** Optional additional class names */
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────

function getTimeRemaining(scheduledDate: string): {
  totalMs: number;
  hours: number;
  minutes: number;
} {
  const now = Date.now();
  const target = new Date(scheduledDate).getTime();
  const totalMs = target - now;

  if (totalMs <= 0) {
    return { totalMs, hours: 0, minutes: 0 };
  }

  const totalMinutes = Math.floor(totalMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { totalMs, hours, minutes };
}

function formatCountdown(hours: number, minutes: number): string {
  if (hours > 0) {
    return `Publishes in ${hours}h ${minutes}m`;
  }
  return `Publishes in ${minutes}m`;
}

// ── Component ─────────────────────────────────────────────────

export function ScheduledCountdown({
  scheduledDate,
  className,
}: ScheduledCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getTimeRemaining(scheduledDate)
  );

  useEffect(() => {
    // Recalculate immediately in case SSR/hydration mismatch
    setTimeRemaining(getTimeRemaining(scheduledDate));

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(scheduledDate));
    }, 60_000); // Update every minute

    return () => clearInterval(interval);
  }, [scheduledDate]);

  const { totalMs, hours, minutes } = timeRemaining;

  // Determine display state
  let label: string;
  let variant: 'countdown' | 'soon' | 'overdue';

  if (totalMs <= 0) {
    label = 'Overdue';
    variant = 'overdue';
  } else if (totalMs < 5 * 60 * 1000) {
    label = 'Publishing soon';
    variant = 'soon';
  } else {
    label = formatCountdown(hours, minutes);
    variant = 'countdown';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        // Use semantic-warning for countdown/soon, semantic-danger for overdue
        variant === 'overdue'
          ? 'bg-semantic-danger/10 text-semantic-danger'
          : 'bg-semantic-warning/10 text-semantic-warning',
        // Subtle pulse for "Publishing soon" state (respects reduced motion via globals.css)
        variant === 'soon' && 'animate-pulse-glow',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {/* Clock icon */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {label}
    </span>
  );
}
