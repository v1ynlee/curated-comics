'use client';

// ============================================================
// DetailsCard — Primary information card for the Title Editor
// Displays title metadata fields including Author, Artist,
// Release Date, Completed Date, and integrates GenreMoodSelector.
// Wrapped with CardWrapper for per-card save behavior.
// Requirements: 5.1, 5.2, 5.3, 8.1, 8.2
// ============================================================

import { useCallback } from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { CardWrapper } from '@/components/studio/CardWrapper';
import { CustomDropdown } from '@/components/studio/CustomDropdown';
import { CustomDatepicker } from '@/components/studio/CustomDatepicker';
import { GenreMoodSelector } from '@/components/studio/GenreMoodSelector';
import { TIER_CONFIG } from '@/types/title';
import type { TierLevel, Origin, SeriesStatus, ReadingStatus } from '@/types/title';
import type { TitleFormData } from '@/types/studio';
import type { DropdownOption } from '@/components/studio/CustomDropdown';

// ── Props ─────────────────────────────────────────────────────

interface DetailsCardProps {
  formData: TitleFormData;
  onFieldChange: <K extends keyof TitleFormData>(key: K, value: TitleFormData[K]) => void;
  onSave: () => Promise<void>;
  genres?: { id: string; name: string }[];
  moods?: { id: string; name: string }[];
  onToggleGenre: (id: string) => void;
  onToggleMood: (id: string) => void;
  onAddGenre?: (name: string) => void;
  onAddMood?: (name: string) => void;
  disabled?: boolean;
}

// ── Constants ─────────────────────────────────────────────────

const ORIGIN_OPTIONS: DropdownOption<Origin>[] = [
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manga', label: 'Manga' },
  { value: 'manhua', label: 'Manhua' },
];

const SERIES_STATUS_OPTIONS: DropdownOption<SeriesStatus>[] = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
  { value: 'cancelled', label: 'Cancelled' },
];

const READING_STATUS_OPTIONS: DropdownOption<ReadingStatus>[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'paused', label: 'Paused' },
  { value: 'wishlist', label: 'Wishlist' },
  { value: 'hidden-gem', label: 'Hidden Gem' },
  { value: 'guilty-pleasure', label: 'Guilty Pleasure' },
  { value: 'top-favorite', label: 'Top Favorite' },
  { value: 'most-reread', label: 'Most Reread' },
];

const TIER_OPTIONS: DropdownOption<TierLevel>[] = Object.entries(TIER_CONFIG).map(
  ([tier, config]) => ({
    value: tier as TierLevel,
    label: `${tier} — ${config.label}`,
    color: config.color,
    description: config.description,
  })
);

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

export function DetailsCard({
  formData,
  onFieldChange,
  onSave,
  genres = [],
  moods = [],
  onToggleGenre,
  onToggleMood,
  onAddGenre,
  onAddMood,
  disabled = false,
}: DetailsCardProps) {
  // ── Alternative titles management ─────────────────────────

  const handleAltTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const input = e.currentTarget;
        const trimmed = input.value.trim();
        if (trimmed && !formData.alternativeTitles?.includes(trimmed)) {
          onFieldChange('alternativeTitles', [...(formData.alternativeTitles ?? []), trimmed]);
          input.value = '';
        }
      }
    },
    [formData.alternativeTitles, onFieldChange]
  );

  const removeAltTitle = useCallback(
    (title: string) => {
      onFieldChange(
        'alternativeTitles',
        (formData.alternativeTitles ?? []).filter((t) => t !== title)
      );
    },
    [formData.alternativeTitles, onFieldChange]
  );

  // ── Render ────────────────────────────────────────────────

  return (
    <CardWrapper
      title="Details"
      icon={<FileText className="w-4 h-4" />}
      onSave={onSave}
      disabled={disabled}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* English Title */}
        <div className="md:col-span-2">
          <label htmlFor="englishTitle" className={labelClass}>
            English Title *
          </label>
          <input
            id="englishTitle"
            type="text"
            required
            value={formData.englishTitle}
            onChange={(e) => onFieldChange('englishTitle', e.target.value)}
            placeholder="e.g. Solo Leveling"
            className={inputClass}
          />
        </div>

        {/* Original Title */}
        <div>
          <label htmlFor="originalTitle" className={labelClass}>
            Original Title
          </label>
          <input
            id="originalTitle"
            type="text"
            value={formData.originalTitle ?? ''}
            onChange={(e) => onFieldChange('originalTitle', e.target.value)}
            placeholder="e.g. 나 혼자만 레벨업"
            className={inputClass}
          />
        </div>

        {/* Origin */}
        <CustomDropdown<Origin>
          id="origin"
          label="Origin"
          options={ORIGIN_OPTIONS}
          value={formData.origin as Origin}
          onChange={(val) => onFieldChange('origin', val)}
        />

        {/* Alternative Titles */}
        <div className="md:col-span-2">
          <label htmlFor="altTitleInput" className={labelClass}>
            Alternative Titles
          </label>
          <input
            id="altTitleInput"
            type="text"
            onKeyDown={handleAltTitleKeyDown}
            placeholder="Add an alternative title and press Enter"
            className={inputClass}
          />
          {(formData.alternativeTitles?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.alternativeTitles!.map((title) => (
                <span
                  key={title}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-deep/60 border border-white/10 text-text-secondary text-xs"
                >
                  {title}
                  <button
                    type="button"
                    onClick={() => removeAltTitle(title)}
                    className="text-text-tertiary hover:text-semantic-danger transition-colors"
                    aria-label={`Remove ${title}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className={labelClass}>
            Author
          </label>
          <input
            id="author"
            type="text"
            value={formData.author ?? ''}
            onChange={(e) => onFieldChange('author', e.target.value)}
            placeholder="e.g. Chugong"
            className={inputClass}
          />
        </div>

        {/* Artist */}
        <div>
          <label htmlFor="artist" className={labelClass}>
            Artist
          </label>
          <input
            id="artist"
            type="text"
            value={formData.artist ?? ''}
            onChange={(e) => onFieldChange('artist', e.target.value)}
            placeholder="e.g. Dubu (Redice Studio)"
            className={inputClass}
          />
        </div>

        {/* Series Status */}
        <CustomDropdown<SeriesStatus>
          id="seriesStatus"
          label="Series Status"
          options={SERIES_STATUS_OPTIONS}
          value={formData.seriesStatus as SeriesStatus}
          onChange={(val) => onFieldChange('seriesStatus', val)}
        />

        {/* Reading Status */}
        <CustomDropdown<ReadingStatus>
          id="readingStatus"
          label="Reading Status"
          options={READING_STATUS_OPTIONS}
          value={formData.readingStatus as ReadingStatus}
          onChange={(val) => onFieldChange('readingStatus', val)}
        />

        {/* Tier */}
        <CustomDropdown<TierLevel>
          id="tier"
          label="Tier"
          options={TIER_OPTIONS}
          value={formData.tier}
          onChange={(val) => onFieldChange('tier', val)}
        />

        {/* Release Date */}
        <CustomDatepicker
          id="releaseDate"
          label="Release Date"
          value={formData.releaseDate ?? ''}
          onChange={(val) => onFieldChange('releaseDate', val)}
        />

        {/* Completed Date */}
        <CustomDatepicker
          id="completedDate"
          label="Completed Date"
          value={formData.completedDate ?? ''}
          onChange={(val) => onFieldChange('completedDate', val)}
        />

        {/* Synopsis */}
        <div className="md:col-span-2">
          <label htmlFor="synopsis" className={labelClass}>
            Synopsis
          </label>
          <textarea
            id="synopsis"
            value={formData.synopsis ?? ''}
            onChange={(e) => onFieldChange('synopsis', e.target.value)}
            placeholder="Brief synopsis of the title..."
            rows={3}
            className={cn(inputClass, 'resize-y')}
          />
        </div>

        {/* Vibe Check */}
        <div className="md:col-span-2">
          <label htmlFor="vibeCheck" className={labelClass}>
            Vibe Check
          </label>
          <textarea
            id="vibeCheck"
            value={formData.vibeCheck ?? ''}
            onChange={(e) => onFieldChange('vibeCheck', e.target.value)}
            placeholder="What's the vibe? One-liner energy description..."
            rows={2}
            className={cn(inputClass, 'resize-y')}
          />
        </div>

        {/* Genres — integrated GenreMoodSelector */}
        <div className="md:col-span-2">
          <GenreMoodSelector
            type="genre"
            available={genres}
            selected={formData.genres}
            onToggle={onToggleGenre}
            onAddNew={onAddGenre}
          />
        </div>

        {/* Moods — integrated GenreMoodSelector */}
        <div className="md:col-span-2">
          <GenreMoodSelector
            type="mood"
            available={moods}
            selected={formData.moods}
            onToggle={onToggleMood}
            onAddNew={onAddMood}
          />
        </div>
      </div>
    </CardWrapper>
  );
}
