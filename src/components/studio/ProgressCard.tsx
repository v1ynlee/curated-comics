'use client';

// ============================================================
// ProgressCard — Progress tracking card for the Title Editor
// Uses CustomDatepicker for date fields and CardWrapper for
// per-card save behavior. Includes chapters read/total as
// number inputs.
// Requirements: 9.1, 9.2
// ============================================================

import { cn } from '@/lib/utils/cn';
import { TrendingUp } from 'lucide-react';
import { CardWrapper } from '@/components/studio/CardWrapper';
import { CustomDatepicker } from '@/components/studio/CustomDatepicker';

// ── Props ─────────────────────────────────────────────────────

export interface ProgressCardProps {
  chaptersRead?: number;
  totalChapters?: number;
  startedDate: string;
  completedDate: string;
  lastReadDate: string;
  onChaptersReadChange: (value: number | undefined) => void;
  onTotalChaptersChange: (value: number | undefined) => void;
  onStartedDateChange: (value: string) => void;
  onCompletedDateChange: (value: string) => void;
  onLastReadDateChange: (value: string) => void;
  onSave: () => Promise<void>;
  disabled?: boolean;
}

// ── Shared styles ─────────────────────────────────────────────

const inputClass = cn(
  'w-full px-3 py-2.5 rounded-lg',
  'bg-bg-deep/60 border border-white/10',
  'font-body text-sm text-text-primary placeholder:text-text-tertiary',
  'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
  'transition-colors duration-150',
);

const labelClass = 'block font-heading text-xs uppercase tracking-wider text-text-secondary mb-1.5';

// ── Component ─────────────────────────────────────────────────

export function ProgressCard({
  chaptersRead,
  totalChapters,
  startedDate,
  completedDate,
  lastReadDate,
  onChaptersReadChange,
  onTotalChaptersChange,
  onStartedDateChange,
  onCompletedDateChange,
  onLastReadDateChange,
  onSave,
  disabled,
}: ProgressCardProps) {
  return (
    <CardWrapper
      title="Progress"
      icon={<TrendingUp className="w-4 h-4" />}
      onSave={onSave}
      disabled={disabled}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* Chapters Read */}
        <div>
          <label htmlFor="chaptersRead" className={labelClass}>
            Chapters Read
          </label>
          <input
            id="chaptersRead"
            type="number"
            min={0}
            value={chaptersRead ?? ''}
            onChange={(e) =>
              onChaptersReadChange(e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="0"
            className={inputClass}
          />
        </div>

        {/* Total Chapters */}
        <div>
          <label htmlFor="totalChapters" className={labelClass}>
            Total Chapters
          </label>
          <input
            id="totalChapters"
            type="number"
            min={0}
            value={totalChapters ?? ''}
            onChange={(e) =>
              onTotalChaptersChange(e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="Ongoing"
            className={inputClass}
          />
        </div>

        {/* Started Date — CustomDatepicker */}
        <div>
          <CustomDatepicker
            id="startedDate"
            label="Started Date"
            value={startedDate}
            onChange={onStartedDateChange}
            placeholder="Select start date"
          />
        </div>

        {/* Completed Date — CustomDatepicker */}
        <div>
          <CustomDatepicker
            id="completedDate"
            label="Completed Date"
            value={completedDate}
            onChange={onCompletedDateChange}
            placeholder="Select completion date"
          />
        </div>

        {/* Last Read Date — CustomDatepicker */}
        <div>
          <CustomDatepicker
            id="lastReadDate"
            label="Last Read Date"
            value={lastReadDate}
            onChange={onLastReadDateChange}
            placeholder="Select last read date"
          />
        </div>
      </div>
    </CardWrapper>
  );
}
