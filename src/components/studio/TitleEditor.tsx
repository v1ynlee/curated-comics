'use client';

// ============================================================
// TitleEditor — Full title creation/editing form for Studio CMS
// Integrates ImageUploader for covers/banners, genre/mood multi-select,
// and a markdown review editor with split-pane live preview.
// Requirements: 8.1, 8.2, 8.4, 8.5, 8.6
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/cn';
import { ImageUploader } from '@/components/studio/ImageUploader';
import { TIER_CONFIG } from '@/types/title';
import type { TierLevel, Origin, SeriesStatus, ReadingStatus } from '@/types/title';
import type { TitleFormData } from '@/types/studio';
import type { MediaAsset } from '@/types/media';

// ── Props ─────────────────────────────────────────────────────

interface TitleEditorProps {
  mode: 'create' | 'edit';
  initialData?: TitleFormData;
  onSave: (data: TitleFormData) => Promise<void>;
  genres?: { id: string; name: string }[];
  moods?: { id: string; name: string }[];
}

// ── Constants ─────────────────────────────────────────────────

const ORIGIN_OPTIONS: { value: Origin; label: string }[] = [
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manga', label: 'Manga' },
  { value: 'manhua', label: 'Manhua' },
];

const SERIES_STATUS_OPTIONS: { value: SeriesStatus; label: string }[] = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
  { value: 'cancelled', label: 'Cancelled' },
];

const READING_STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
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

const TIER_OPTIONS: TierLevel[] = ['SSS+', 'S', 'A', 'B', 'C', 'D', 'F'];

// ── Default form state ────────────────────────────────────────

function getDefaultFormData(): TitleFormData {
  return {
    englishTitle: '',
    originalTitle: '',
    alternativeTitles: [],
    origin: 'manhwa',
    seriesStatus: 'ongoing',
    readingStatus: 'reading',
    chaptersRead: undefined,
    totalChapters: undefined,
    startedDate: '',
    completedDate: '',
    lastReadDate: '',
    tier: 'B',
    synopsis: '',
    vibeCheck: '',
    quotableLines: [],
    review: '',
    featured: false,
    hidden: false,
    genres: [],
    moods: [],
    coverImageId: undefined,
    bannerImageId: undefined,
  };
}

// ── Shared input styles ───────────────────────────────────────

const inputClass = cn(
  'w-full px-3 py-2.5 rounded-lg',
  'bg-bg-deep/60 border border-white/10',
  'font-body text-sm text-text-primary placeholder:text-text-tertiary',
  'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
  'transition-colors duration-150',
);

const labelClass = 'block font-heading text-xs uppercase tracking-wider text-text-secondary mb-1.5';

const sectionClass = cn(
  'p-5 rounded-lg',
  'bg-bg-surface/40 border border-white/5',
);

// ── Component ─────────────────────────────────────────────────

export function TitleEditor({
  mode,
  initialData,
  onSave,
  genres = [],
  moods = [],
}: TitleEditorProps) {
  const [formData, setFormData] = useState<TitleFormData>(
    initialData ?? getDefaultFormData()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [altTitleInput, setAltTitleInput] = useState('');
  const [quotableInput, setQuotableInput] = useState('');
  const [showReviewPreview, setShowReviewPreview] = useState(true);

  // ── Slug for image uploader (derived from english title) ──

  const slug = useMemo(() => {
    return formData.englishTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled';
  }, [formData.englishTitle]);

  // ── Field update helpers ──────────────────────────────────

  const updateField = useCallback(<K extends keyof TitleFormData>(
    key: K,
    value: TitleFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Alternative titles management ─────────────────────────

  const addAltTitle = useCallback(() => {
    const trimmed = altTitleInput.trim();
    if (trimmed && !formData.alternativeTitles?.includes(trimmed)) {
      updateField('alternativeTitles', [...(formData.alternativeTitles ?? []), trimmed]);
      setAltTitleInput('');
    }
  }, [altTitleInput, formData.alternativeTitles, updateField]);

  const removeAltTitle = useCallback((title: string) => {
    updateField(
      'alternativeTitles',
      (formData.alternativeTitles ?? []).filter((t) => t !== title)
    );
  }, [formData.alternativeTitles, updateField]);

  // ── Quotable lines management ─────────────────────────────

  const addQuotable = useCallback(() => {
    const trimmed = quotableInput.trim();
    if (trimmed && !formData.quotableLines?.includes(trimmed)) {
      updateField('quotableLines', [...(formData.quotableLines ?? []), trimmed]);
      setQuotableInput('');
    }
  }, [quotableInput, formData.quotableLines, updateField]);

  const removeQuotable = useCallback((line: string) => {
    updateField(
      'quotableLines',
      (formData.quotableLines ?? []).filter((l) => l !== line)
    );
  }, [formData.quotableLines, updateField]);

  // ── Genre/mood toggle ─────────────────────────────────────

  const toggleGenre = useCallback((genreId: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }));
  }, []);

  const toggleMood = useCallback((moodId: string) => {
    setFormData((prev) => ({
      ...prev,
      moods: prev.moods.includes(moodId)
        ? prev.moods.filter((id) => id !== moodId)
        : [...prev.moods, moodId],
    }));
  }, []);

  // ── Image upload handlers ─────────────────────────────────

  const handleCoverUpload = useCallback((asset: MediaAsset) => {
    updateField('coverImageId', asset.id);
  }, [updateField]);

  const handleBannerUpload = useCallback((asset: MediaAsset) => {
    updateField('bannerImageId', asset.id);
  }, [updateField]);

  // ── Form submission ───────────────────────────────────────

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onSave(formData);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save title. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSave]);

  // ── Render ────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* ═══════════════════════════════════════════════════════
          Section: Basic Info
          ═══════════════════════════════════════════════════════ */}
      <fieldset className={sectionClass}>
        <legend className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Basic Info
        </legend>

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
              onChange={(e) => updateField('englishTitle', e.target.value)}
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
              onChange={(e) => updateField('originalTitle', e.target.value)}
              placeholder="e.g. 나 혼자만 레벨업"
              className={inputClass}
            />
          </div>

          {/* Origin */}
          <div>
            <label htmlFor="origin" className={labelClass}>
              Origin
            </label>
            <select
              id="origin"
              value={formData.origin}
              onChange={(e) => updateField('origin', e.target.value)}
              className={inputClass}
            >
              {ORIGIN_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Alternative Titles */}
          <div className="md:col-span-2">
            <label htmlFor="altTitleInput" className={labelClass}>
              Alternative Titles
            </label>
            <div className="flex gap-2">
              <input
                id="altTitleInput"
                type="text"
                value={altTitleInput}
                onChange={(e) => setAltTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAltTitle();
                  }
                }}
                placeholder="Add an alternative title and press Enter"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addAltTitle}
                className={cn(
                  'px-4 py-2.5 rounded-lg shrink-0',
                  'bg-accent-primary/20 text-accent-primary font-heading text-sm font-bold',
                  'hover:bg-accent-primary/30 transition-colors duration-150',
                )}
              >
                Add
              </button>
            </div>
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

          {/* Series Status */}
          <div>
            <label htmlFor="seriesStatus" className={labelClass}>
              Series Status
            </label>
            <select
              id="seriesStatus"
              value={formData.seriesStatus}
              onChange={(e) => updateField('seriesStatus', e.target.value)}
              className={inputClass}
            >
              {SERIES_STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Reading Status */}
          <div>
            <label htmlFor="readingStatus" className={labelClass}>
              Reading Status
            </label>
            <select
              id="readingStatus"
              value={formData.readingStatus}
              onChange={(e) => updateField('readingStatus', e.target.value)}
              className={inputClass}
            >
              {READING_STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Tier */}
          <div>
            <label htmlFor="tier" className={labelClass}>
              Tier
            </label>
            <select
              id="tier"
              value={formData.tier}
              onChange={(e) => updateField('tier', e.target.value as TierLevel)}
              className={inputClass}
            >
              {TIER_OPTIONS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier} — {TIER_CONFIG[tier].label}
                </option>
              ))}
            </select>
          </div>

          {/* Synopsis */}
          <div className="md:col-span-2">
            <label htmlFor="synopsis" className={labelClass}>
              Synopsis
            </label>
            <textarea
              id="synopsis"
              value={formData.synopsis ?? ''}
              onChange={(e) => updateField('synopsis', e.target.value)}
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
              onChange={(e) => updateField('vibeCheck', e.target.value)}
              placeholder="What's the vibe? One-liner energy description..."
              rows={2}
              className={cn(inputClass, 'resize-y')}
            />
          </div>
        </div>
      </fieldset>

      {/* ═══════════════════════════════════════════════════════
          Section: Media
          ═══════════════════════════════════════════════════════ */}
      <fieldset className={sectionClass}>
        <legend className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Media
        </legend>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Cover Image */}
          <div>
            <span className={labelClass}>Cover Image</span>
            <ImageUploader
              slug={slug}
              assetType="cover"
              onUploadComplete={handleCoverUpload}
            />
          </div>

          {/* Banner Image */}
          <div>
            <span className={labelClass}>Banner Image</span>
            <ImageUploader
              slug={slug}
              assetType="banner"
              onUploadComplete={handleBannerUpload}
            />
          </div>
        </div>
      </fieldset>

      {/* ═══════════════════════════════════════════════════════
          Section: Classification
          ═══════════════════════════════════════════════════════ */}
      <fieldset className={sectionClass}>
        <legend className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Classification
        </legend>

        {/* Genres */}
        <div className="mb-5">
          <span className={labelClass}>Genres</span>
          {genres.length === 0 ? (
            <p className="text-text-tertiary text-xs">No genres available.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => {
                const isSelected = formData.genres.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => toggleGenre(genre.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                      'border focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
                      isSelected
                        ? 'bg-accent-primary/20 border-accent-primary/50 text-accent-primary'
                        : 'bg-bg-deep/40 border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary',
                    )}
                    aria-pressed={isSelected}
                  >
                    {genre.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Moods */}
        <div>
          <span className={labelClass}>Moods</span>
          {moods.length === 0 ? (
            <p className="text-text-tertiary text-xs">No moods available.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => {
                const isSelected = formData.moods.includes(mood.id);
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => toggleMood(mood.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                      'border focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
                      isSelected
                        ? 'bg-accent-secondary/20 border-accent-secondary/50 text-accent-secondary'
                        : 'bg-bg-deep/40 border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary',
                    )}
                    aria-pressed={isSelected}
                  >
                    {mood.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </fieldset>

      {/* ═══════════════════════════════════════════════════════
          Section: Progress
          ═══════════════════════════════════════════════════════ */}
      <fieldset className={sectionClass}>
        <legend className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Progress
        </legend>

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
              value={formData.chaptersRead ?? ''}
              onChange={(e) =>
                updateField('chaptersRead', e.target.value ? Number(e.target.value) : undefined)
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
              value={formData.totalChapters ?? ''}
              onChange={(e) =>
                updateField('totalChapters', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="Ongoing"
              className={inputClass}
            />
          </div>

          {/* Started Date */}
          <div>
            <label htmlFor="startedDate" className={labelClass}>
              Started Date
            </label>
            <input
              id="startedDate"
              type="date"
              value={formData.startedDate ?? ''}
              onChange={(e) => updateField('startedDate', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Completed Date */}
          <div>
            <label htmlFor="completedDate" className={labelClass}>
              Completed Date
            </label>
            <input
              id="completedDate"
              type="date"
              value={formData.completedDate ?? ''}
              onChange={(e) => updateField('completedDate', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Last Read Date */}
          <div>
            <label htmlFor="lastReadDate" className={labelClass}>
              Last Read Date
            </label>
            <input
              id="lastReadDate"
              type="date"
              value={formData.lastReadDate ?? ''}
              onChange={(e) => updateField('lastReadDate', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      {/* ═══════════════════════════════════════════════════════
          Section: Review (Markdown with live preview)
          ═══════════════════════════════════════════════════════ */}
      <fieldset className={sectionClass}>
        <legend className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Review
        </legend>

        {/* Toggle preview */}
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => setShowReviewPreview(false)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150',
              !showReviewPreview
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setShowReviewPreview(true)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150',
              showReviewPreview
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            Split Preview
          </button>
        </div>

        <div className={cn(
          'grid gap-4',
          showReviewPreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
        )}>
          {/* Editor */}
          <div>
            <label htmlFor="review" className="sr-only">
              Review (Markdown)
            </label>
            <textarea
              id="review"
              value={formData.review ?? ''}
              onChange={(e) => updateField('review', e.target.value)}
              placeholder="Write your review in Markdown..."
              rows={12}
              className={cn(inputClass, 'resize-y font-mono text-xs leading-relaxed')}
            />
          </div>

          {/* Live Preview */}
          {showReviewPreview && (
            <div
              className={cn(
                'p-4 rounded-lg overflow-y-auto max-h-[400px]',
                'bg-bg-deep/40 border border-white/5',
                'prose prose-invert prose-sm max-w-none',
                'prose-headings:font-heading prose-headings:text-text-primary',
                'prose-p:text-text-secondary prose-p:leading-relaxed',
                'prose-a:text-accent-primary prose-a:no-underline hover:prose-a:underline',
                'prose-strong:text-text-primary',
                'prose-code:text-accent-secondary prose-code:bg-bg-surface/60 prose-code:px-1 prose-code:rounded',
              )}
            >
              {formData.review ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {formData.review}
                </ReactMarkdown>
              ) : (
                <p className="text-text-tertiary italic text-xs">
                  Preview will appear here as you write...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quotable Lines */}
        <div className="mt-5">
          <label htmlFor="quotableInput" className={labelClass}>
            Quotable Lines
          </label>
          <div className="flex gap-2">
            <input
              id="quotableInput"
              type="text"
              value={quotableInput}
              onChange={(e) => setQuotableInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addQuotable();
                }
              }}
              placeholder="Add a memorable quote and press Enter"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addQuotable}
              className={cn(
                'px-4 py-2.5 rounded-lg shrink-0',
                'bg-accent-primary/20 text-accent-primary font-heading text-sm font-bold',
                'hover:bg-accent-primary/30 transition-colors duration-150',
              )}
            >
              Add
            </button>
          </div>
          {(formData.quotableLines?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {formData.quotableLines!.map((line) => (
                <div
                  key={line}
                  className="flex items-start gap-2 px-3 py-2 rounded-md bg-bg-deep/60 border border-white/10"
                >
                  <span className="text-accent-secondary text-xs italic flex-1">
                    &ldquo;{line}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={() => removeQuotable(line)}
                    className="text-text-tertiary hover:text-semantic-danger transition-colors shrink-0"
                    aria-label={`Remove quote: ${line}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </fieldset>

      {/* ═══════════════════════════════════════════════════════
          Section: Settings
          ═══════════════════════════════════════════════════════ */}
      <fieldset className={sectionClass}>
        <legend className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Settings
        </legend>

        <div className="flex flex-col gap-4">
          {/* Featured */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => updateField('featured', e.target.checked)}
              className={cn(
                'w-5 h-5 rounded border-2 border-white/20 bg-bg-deep/60',
                'checked:bg-accent-primary checked:border-accent-primary',
                'focus:ring-2 focus:ring-accent-primary/30 focus:ring-offset-0',
                'transition-colors duration-150 cursor-pointer',
              )}
            />
            <span className="font-body text-sm text-text-primary group-hover:text-accent-primary transition-colors">
              Featured on homepage
            </span>
          </label>

          {/* Hidden */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.hidden}
              onChange={(e) => updateField('hidden', e.target.checked)}
              className={cn(
                'w-5 h-5 rounded border-2 border-white/20 bg-bg-deep/60',
                'checked:bg-semantic-warning checked:border-semantic-warning',
                'focus:ring-2 focus:ring-semantic-warning/30 focus:ring-offset-0',
                'transition-colors duration-150 cursor-pointer',
              )}
            />
            <span className="font-body text-sm text-text-primary group-hover:text-semantic-warning transition-colors">
              Hidden from public view
            </span>
          </label>
        </div>
      </fieldset>

      {/* ═══════════════════════════════════════════════════════
          Submit
          ═══════════════════════════════════════════════════════ */}
      {submitError && (
        <div
          className="p-3 rounded-md bg-semantic-danger/10 border border-semantic-danger/20"
          role="alert"
        >
          <p className="text-semantic-danger text-sm font-medium">{submitError}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !formData.englishTitle.trim()}
          className={cn(
            'px-6 py-3 rounded-lg',
            'bg-accent-primary text-white font-heading text-sm font-bold',
            'hover:bg-accent-primary/90 transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {isSubmitting
            ? 'Saving...'
            : mode === 'create'
              ? 'Create Title'
              : 'Save Changes'}
        </button>

        {isSubmitting && (
          <span className="text-text-tertiary text-xs animate-pulse">
            Processing...
          </span>
        )}
      </div>
    </form>
  );
}
