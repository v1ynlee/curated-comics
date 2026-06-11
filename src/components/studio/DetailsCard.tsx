'use client';

// ============================================================
// DetailsCard — Primary information card for the Title Editor
// Displays title metadata fields including Author, Artist,
// Release Date, Completed Date, and integrates GenreMoodSelector.
// Wrapped with CardWrapper for per-card save behavior.
// Requirements: 5.1, 5.2, 5.3, 8.1, 8.2
// ============================================================

import { useCallback } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Check, FileText, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { CardWrapper } from '@/components/studio/CardWrapper';
import { CustomDropdown } from '@/components/studio/CustomDropdown';
import { CustomDatepicker } from '@/components/studio/CustomDatepicker';
import { GenreMoodSelector } from '@/components/studio/GenreMoodSelector';
import { ImageUploader } from '@/components/studio/ImageUploader';
import { TIER_CONFIG } from '@/types/title';
import type { TierLevel, Origin, SeriesStatus, ReadingStatus } from '@/types/title';
import type { TitleFormData } from '@/types/studio';
import type { DropdownOption } from '@/components/studio/CustomDropdown';
import type { MediaAsset } from '@/types/media';

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
  // Media props (cover image merged into Details)
  slug: string;
  coverImageId?: string;
  pendingCoverFile?: File | null;
  previewSrc?: string | null;
  onCoverFileSelect?: (file: File | null) => void;
  onCoverUpload?: (asset: MediaAsset) => void;
  onFillWithAI?: () => void;
  aiState?: 'idle' | 'loading' | 'success';
  isDirty?: boolean;
  isValid?: boolean;
  onCancel?: () => void;
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
  slug,
  coverImageId,
  pendingCoverFile,
  previewSrc,
  onCoverFileSelect,
  onCoverUpload,
  onFillWithAI,
  aiState = 'idle',
  isDirty = true,
  isValid = true,
  onCancel,
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
          toast.info('Alternative title added.');
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
      toast.info('Alternative title removed.');
    },
    [formData.alternativeTitles, onFieldChange]
  );

  // ── Render ────────────────────────────────────────────────

  return (
    <CardWrapper
      title="Details"
      icon={<FileText className="w-4 h-4" />}
      onSave={onSave}
      onCancel={onCancel}
      disabled={disabled}
      isDirty={isDirty}
      isValid={isValid}
      actions={onFillWithAI ? (
        <button
          type="button"
          onClick={onFillWithAI}
          disabled={aiState === 'loading'}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium',
            'text-text-secondary transition-colors duration-150 hover:bg-white/5 hover:text-text-primary',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            aiState === 'loading' && 'cursor-wait opacity-70',
          )}
        >
          {aiState === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : aiState === 'success' ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
          {aiState === 'loading' ? 'Searching...' : aiState === 'success' ? 'Completed' : 'Fill With AI'}
        </button>
      ) : undefined}
    >
      {/* ── Cover Image + Banner Preview ── */}
      <div className="mb-6 pb-6 border-b border-white/5">
        {/* Banner + Cover composite layout */}
        <div className="relative mb-4">
          {/* Blurred banner preview (cropped from center) */}
          {previewSrc ? (
            <div className="group/banner relative w-full rounded-lg overflow-hidden border border-white/10 bg-bg-deep/60" style={{ aspectRatio: '16 / 5' }}>
              <Image
                src={previewSrc}
                alt=""
                fill
                className="object-cover object-center blur-[6px] scale-105"
                sizes="(max-width: 640px) 100vw, 700px"
                unoptimized={!!pendingCoverFile}
                aria-hidden="true"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-bg-deep/30" />
              {/* Replace overlay on hover */}
              <label className="absolute inset-0 flex items-center justify-center bg-bg-deep/60 opacity-0 group-hover/banner:opacity-100 transition-opacity duration-200 cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onCoverFileSelect?.(file);
                    e.target.value = '';
                  }}
                />
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 backdrop-blur-sm text-text-primary text-xs font-medium border border-white/20">
                  <ImageIcon size={14} aria-hidden="true" />
                  Replace
                </span>
              </label>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-bg-deep/70 text-text-tertiary text-[10px] pointer-events-none">
                Banner preview
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-bg-deep/40 text-text-tertiary"
              style={{ aspectRatio: '16 / 5' }}
            >
              <div className="flex flex-col items-center gap-1">
                <ImageIcon className="w-5 h-5 opacity-40" aria-hidden="true" />
                <span className="text-[11px]">Upload a cover to see the banner preview</span>
              </div>
            </div>
          )}

          {/* Cover thumbnail overlapping bottom-left of banner */}
          {previewSrc && (
            <div className="group/cover absolute -bottom-10 left-5 w-32 h-44 rounded-lg overflow-hidden border-[3px] border-bg-deep shadow-xl shadow-black/40">
              <Image
                src={previewSrc}
                alt={`Cover for ${slug}`}
                fill
                className="object-cover"
                sizes="128px"
                unoptimized={!!pendingCoverFile}
              />
              {/* Replace overlay on hover */}
              <label className="absolute inset-0 flex items-center justify-center bg-bg-deep/70 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onCoverFileSelect?.(file);
                    e.target.value = '';
                  }}
                />
                <span className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 backdrop-blur-sm text-text-primary text-[10px] font-medium border border-white/20">
                  <ImageIcon size={12} aria-hidden="true" />
                  Replace
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Spacer for the overlapping cover thumbnail */}
        {previewSrc && <div className="h-8" />}

        {/* Upload form: only shown when NO image is present */}
        {!previewSrc && (
          <div className="flex flex-col gap-2 mt-2">
            <span className="block font-heading text-xs uppercase tracking-wider text-text-secondary">
              Cover Image
            </span>
            <ImageUploader
              slug={slug}
              assetType="cover"
              onFileSelect={(file) => onCoverFileSelect?.(file)}
              onUploadComplete={(asset) => onCoverUpload?.(asset)}
              pendingFile={pendingCoverFile ?? null}
            />
          </div>
        )}

        {/* Pending upload indicator (shown below preview when image selected but not yet saved) */}
        {previewSrc && pendingCoverFile && !coverImageId && (
          <p className="text-accent-primary text-xs mt-2">
            Image selected; will upload on save
          </p>
        )}
      </div>

      {/* ── Form Fields ── */}
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
