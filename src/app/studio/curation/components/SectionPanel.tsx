'use client';

// ============================================================
// Shared editorial section container
// ============================================================

import { Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SectionPanelProps {
  title: string;
  description?: string;
  count?: number;
  randomEnabled?: boolean;
  onRandomChange?: (enabled: boolean) => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionPanel({
  title,
  description,
  count,
  randomEnabled,
  onRandomChange,
  action,
  children,
}: SectionPanelProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-bg-surface/30" aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-section`}>
      <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 id={`${title.replace(/\s+/g, '-').toLowerCase()}-section`} className="font-heading text-base font-semibold text-text-primary">
              {title}
            </h2>
            {typeof count === 'number' && (
              <span className="font-data text-xs text-text-tertiary">{count}</span>
            )}
          </div>
          {description && <p className="mt-1 max-w-2xl font-body text-sm text-text-secondary">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          {onRandomChange && (
            <button
              type="button"
              onClick={() => onRandomChange(!randomEnabled)}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-md border px-3 font-heading text-xs transition-colors',
                randomEnabled
                  ? 'border-accent-primary/50 bg-accent-primary/10 text-text-primary'
                  : 'border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary',
              )}
              aria-pressed={Boolean(randomEnabled)}
            >
              <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
              Random {randomEnabled ? 'On' : 'Off'}
            </button>
          )}
          {action}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
