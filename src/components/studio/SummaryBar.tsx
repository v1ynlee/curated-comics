// ============================================================
// SummaryBar — Compact inline stats for the Studio dashboard.
// Replaces the hero-metric OverviewCard grid with a single
// dense row of linked stat items. No cards, no icons, no big numbers.
// ============================================================

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export interface SummaryBarStat {
  label: string;
  value: number;
  href: string;
}

interface SummaryBarProps {
  stats: SummaryBarStat[];
}

export function SummaryBar({ stats }: SummaryBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-5 gap-y-2',
        'px-4 py-3 rounded-lg',
        'bg-bg-surface/40 border border-white/5',
      )}
      role="list"
      aria-label="Content overview"
    >
      {stats.map((stat, i) => (
        <Link
          key={stat.label}
          href={stat.href}
          role="listitem"
          className={cn(
            'flex items-baseline gap-1.5 group',
            'transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 rounded-sm',
          )}
        >
          <span className="font-data text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors duration-150">
            {stat.value.toLocaleString()}
          </span>
          <span className="font-body text-xs text-text-tertiary group-hover:text-text-secondary transition-colors duration-150">
            {stat.label}
          </span>
          {i < stats.length - 1 && (
            <span className="ml-3 text-text-tertiary/40 select-none" aria-hidden="true">
              ·
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
