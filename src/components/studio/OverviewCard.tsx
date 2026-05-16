// ============================================================
// OverviewCard — Renders a single stat card on the Dashboard
// Extracted for testability and reuse.
// Requirements: 14.1, 14.2, 14.3
// ============================================================

import { cn } from '@/lib/utils/cn';

export interface OverviewCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  accentClass: string;
}

export function OverviewCard({ icon, label, value, accentClass }: OverviewCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-5 rounded-lg',
        'bg-bg-surface/60 backdrop-blur-sm',
        'border border-white/5',
        'shadow-[0_0_40px_-15px_rgba(139,92,246,0.08)]',
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center w-11 h-11 rounded-lg',
          accentClass,
        )}
      >
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="font-data text-2xl font-bold text-text-primary">
          {value.toLocaleString()}
        </span>
        <span className="font-heading text-[10px] uppercase tracking-[0.15em] text-text-tertiary">
          {label}
        </span>
      </div>
    </div>
  );
}
