'use client';

// ============================================================
// TitleForm — create/edit title with all fields
// Source of truth: docs/architecture/CONTENT_STRUCTURE.md
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { FormField, inputClasses, selectClasses, textareaClasses } from './FormField';
import { ImageUploader } from './ImageUploader';
import { toSlug } from '@/lib/utils/utils';
import {
  adminCreateTitle,
  adminUpdateTitle,
  type TitleFormData,
  type RatingFormData,
  type ReviewFormData,
  type ExternalLinkFormData,
} from '@/services/studio/admin';
import type { Title, TierLevel, ReadingStatus, Origin, SeriesStatus, ExternalPlatform } from '@/types/title';

const ORIGINS: Origin[] = ['manhwa', 'manhua', 'manga'];
const SERIES_STATUSES: SeriesStatus[] = ['ongoing', 'completed', 'hiatus', 'cancelled'];
const READING_STATUSES: ReadingStatus[] = [
  'reading', 'completed', 'dropped', 'paused', 'wishlist',
  'hidden-gem', 'guilty-pleasure', 'top-favorite', 'most-reread',
];
const TIERS: (TierLevel | '')[] = ['', 'SSS+', 'S', 'A', 'B', 'C', 'D', 'F'];
const PLATFORMS: ExternalPlatform[] = [
  'webtoon', 'kakaopage', 'naver', 'tapas', 'mangadex',
  'tappytoon', 'lezhin', 'official', 'other',
];

interface FormOptions {
  genres: { id: string; name: string; slug: string; color: string }[];
  moods: { id: string; name: string; slug: string; emoji: string | null }[];
}

interface TitleFormProps {
  title?: Title;
  options: FormOptions;
  mode: 'create' | 'edit';
}

export function TitleForm({ title, options, mode }: TitleFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'ratings' | 'review' | 'links'>('basic');

  // ── Form state ────────────────────────────────────────────

  const [titleEnglish, setTitleEnglish] = useState(title?.titleEnglish ?? '');
  const [titleOriginal, setTitleOriginal] = useState(title?.titleOriginal ?? '');
  const [origin, setOrigin] = useState<Origin>(title?.origin ?? 'manhwa');
  const [seriesStatus, setSeriesStatus] = useState<SeriesStatus>(title?.status ?? 'ongoing');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>(title?.readingStatus ?? 'reading');
  const [chaptersRead, setChaptersRead] = useState(title?.chaptersRead ?? 0);
  const [totalChapters, setTotalChapters] = useState(title?.totalChapters ?? '');
  const [tier, setTier] = useState<TierLevel | ''>(title?.tier ?? '');
  const [synopsis, setSynopsis] = useState(title?.synopsis ?? '');
  const [vibeCheck, setVibeCheck] = useState(title?.vibeCheck ?? '');
  const [quotableLines, setQuotableLines] = useState(title?.quotableLines?.join('\n') ?? '');
  const [featured, setFeatured] = useState(title?.featured ?? false);
  const [hidden, setHidden] = useState(title?.hidden ?? false);
  const [coverSlug, setCoverSlug] = useState(title?.coverImage?.slug ?? '');
  const [dominantColor, setDominantColor] = useState(title?.coverImage?.dominantColor ?? '');

  // Genre/mood selection
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>(
    title?.genres.map((g) => g.id) ?? [],
  );
  const [selectedMoodIds, setSelectedMoodIds] = useState<string[]>(
    title?.moods.map((m) => m.id) ?? [],
  );
  const [tagsInput, setTagsInput] = useState(title?.tags.join(', ') ?? '');

  // Ratings
  const [ratings, setRatings] = useState<RatingFormData>({
    overall: title?.ratings?.overall ?? 7,
    emotional: title?.ratings?.emotional ?? 7,
    art: title?.ratings?.art ?? 7,
    story: title?.ratings?.story ?? 7,
    pacing: title?.ratings?.pacing ?? 7,
    ending: title?.ratings?.ending,
  });
  const [hasRatings, setHasRatings] = useState(!!title?.ratings);

  // Review
  const [reviewBody, setReviewBody] = useState(title?.review?.body ?? '');
  const [reviewTldr, setReviewTldr] = useState(title?.review?.tldr ?? '');
  const [reviewWhatILoved, setReviewWhatILoved] = useState(title?.review?.whatILoved ?? '');
  const [reviewWhatIHated, setReviewWhatIHated] = useState(title?.review?.whatIHated ?? '');
  const [reviewEmotionalDamage, setReviewEmotionalDamage] = useState(title?.review?.emotionalDamage ?? '');
  const [reviewWouldRecommend, setReviewWouldRecommend] = useState(title?.review?.wouldRecommendTo ?? '');
  const [reviewHasSpoilers, setReviewHasSpoilers] = useState(title?.review?.hasSpoilers ?? false);
  const [hasReview, setHasReview] = useState(!!title?.review);

  // External links
  const [links, setLinks] = useState<ExternalLinkFormData[]>(
    title?.externalLinks.map((l) => ({
      platform: l.platform,
      url: l.url,
      label: l.label ?? '',
    })) ?? [],
  );

  // ── Handlers ──────────────────────────────────────────────

  const toggleGenre = (id: string) => {
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const toggleMood = (id: string) => {
    setSelectedMoodIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const addLink = () => {
    setLinks((prev) => [...prev, { platform: 'webtoon', url: '', label: '' }]);
  };

  const updateLink = (i: number, field: keyof ExternalLinkFormData, value: string) => {
    setLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  };

  const removeLink = (i: number) => {
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEnglish.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData: TitleFormData = {
        titleEnglish: titleEnglish.trim(),
        titleOriginal: titleOriginal.trim() || undefined,
        origin,
        seriesStatus,
        readingStatus,
        chaptersRead,
        totalChapters: totalChapters ? Number(totalChapters) : undefined,
        tier: tier || undefined,
        synopsis: synopsis.trim() || undefined,
        vibeCheck: vibeCheck.trim() || undefined,
        quotableLines: quotableLines.trim()
          ? quotableLines.split('\n').map((l) => l.trim()).filter(Boolean)
          : undefined,
        featured,
        hidden,
        coverSlug: coverSlug || undefined,
        dominantColor: dominantColor || undefined,
        genreIds: selectedGenreIds,
        moodIds: selectedMoodIds,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const ratingData: RatingFormData | undefined = hasRatings ? ratings : undefined;

      const reviewData: ReviewFormData | undefined = hasReview && reviewBody.trim()
        ? {
            body: reviewBody.trim(),
            tldr: reviewTldr.trim() || undefined,
            whatILoved: reviewWhatILoved.trim() || undefined,
            whatIHated: reviewWhatIHated.trim() || undefined,
            emotionalDamage: reviewEmotionalDamage.trim() || undefined,
            wouldRecommendTo: reviewWouldRecommend.trim() || undefined,
            hasSpoilers: reviewHasSpoilers,
          }
        : undefined;

      const linkData = links.filter((l) => l.url.trim());

      if (mode === 'create') {
        const slug = await adminCreateTitle(formData, ratingData, reviewData, linkData);
        router.push(`/admin/titles`);
        router.refresh();
        // Navigate to the new title's edit page
        router.push(`/admin/titles/${slug}/edit`);
      } else if (title) {
        await adminUpdateTitle(title.id, formData, ratingData, reviewData, linkData);
        router.refresh();
        router.push('/admin/titles');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const slug = mode === 'create' ? toSlug(titleEnglish) : (title?.slug ?? '');

  // ── Render ────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 pb-0">
        {(['basic', 'ratings', 'review', 'links'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 font-heading text-xs uppercase tracking-widest',
              'border-b-2 -mb-px transition-colors',
              'focus-visible:outline-2 focus-visible:outline-accent-primary',
              activeTab === tab
                ? 'border-accent-primary text-text-primary'
                : 'border-transparent text-text-tertiary hover:text-text-secondary',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Basic Tab ─────────────────────────────────────── */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Cover image */}
          <div className="md:col-span-2">
            <FormField label="Cover Image" htmlFor="cover-upload">
              <ImageUploader
                slug={slug || 'new-title'}
                currentSlug={title?.coverImage?.slug}
                onUpload={(result) => {
                  setCoverSlug(result.slug);
                  setDominantColor(result.dominantColor);
                }}
              />
            </FormField>
          </div>

          <FormField label="English Title" htmlFor="title-english" required>
            <input
              id="title-english"
              type="text"
              value={titleEnglish}
              onChange={(e) => setTitleEnglish(e.target.value)}
              required
              className={inputClasses}
              placeholder="Solo Leveling"
            />
          </FormField>

          <FormField label="Original Title" htmlFor="title-original" hint="Korean/Japanese/Chinese">
            <input
              id="title-original"
              type="text"
              value={titleOriginal}
              onChange={(e) => setTitleOriginal(e.target.value)}
              className={inputClasses}
              placeholder="나 혼자만 레벨업"
            />
          </FormField>

          <FormField label="Origin" htmlFor="origin" required>
            <select
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value as Origin)}
              className={selectClasses}
            >
              {ORIGINS.map((o) => (
                <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Series Status" htmlFor="series-status" required>
            <select
              id="series-status"
              value={seriesStatus}
              onChange={(e) => setSeriesStatus(e.target.value as SeriesStatus)}
              className={selectClasses}
            >
              {SERIES_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Reading Status" htmlFor="reading-status" required>
            <select
              id="reading-status"
              value={readingStatus}
              onChange={(e) => setReadingStatus(e.target.value as ReadingStatus)}
              className={selectClasses}
            >
              {READING_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Tier" htmlFor="tier">
            <select
              id="tier"
              value={tier}
              onChange={(e) => setTier(e.target.value as TierLevel | '')}
              className={selectClasses}
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>{t || '— None —'}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Chapters Read" htmlFor="chapters-read" required>
            <input
              id="chapters-read"
              type="number"
              min={0}
              value={chaptersRead}
              onChange={(e) => setChaptersRead(Number(e.target.value))}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Total Chapters" htmlFor="total-chapters" hint="Leave blank if ongoing">
            <input
              id="total-chapters"
              type="number"
              min={0}
              value={totalChapters}
              onChange={(e) => setTotalChapters(e.target.value)}
              className={inputClasses}
              placeholder="—"
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Synopsis" htmlFor="synopsis">
              <textarea
                id="synopsis"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className={textareaClasses}
                placeholder="Brief plot summary…"
                rows={3}
              />
            </FormField>
          </div>

          <FormField label="Vibe Check" htmlFor="vibe-check" hint="One-line mood description">
            <input
              id="vibe-check"
              type="text"
              value={vibeCheck}
              onChange={(e) => setVibeCheck(e.target.value)}
              className={inputClasses}
              placeholder="The one that broke me"
            />
          </FormField>

          <FormField label="Tags" htmlFor="tags" hint="Comma-separated">
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className={inputClasses}
              placeholder="isekai, op-mc, system"
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Quotable Lines" htmlFor="quotable-lines" hint="One per line">
              <textarea
                id="quotable-lines"
                value={quotableLines}
                onChange={(e) => setQuotableLines(e.target.value)}
                className={textareaClasses}
                placeholder="I alone level up."
                rows={3}
              />
            </FormField>
          </div>

          {/* Genres */}
          <div className="md:col-span-2">
            <FormField label="Genres" htmlFor="genres">
              <div className="flex flex-wrap gap-2 p-3 rounded-sm bg-surface-elevated/30 border border-white/10">
                {options.genres.map((genre) => {
                  const isSelected = selectedGenreIds.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        'px-2 py-1 rounded-sm font-heading text-[10px] uppercase tracking-widest',
                        'border transition-all duration-150',
                        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                        isSelected
                          ? 'border-white/20'
                          : 'border-white/5 opacity-50 hover:opacity-80',
                      )}
                      style={isSelected ? {
                        color: genre.color,
                        borderColor: `${genre.color}40`,
                        backgroundColor: `${genre.color}15`,
                      } : undefined}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </FormField>
          </div>

          {/* Moods */}
          <div className="md:col-span-2">
            <FormField label="Moods" htmlFor="moods">
              <div className="flex flex-wrap gap-2 p-3 rounded-sm bg-surface-elevated/30 border border-white/10">
                {options.moods.map((mood) => {
                  const isSelected = selectedMoodIds.includes(mood.id);
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => toggleMood(mood.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-sm',
                        'font-heading text-[10px] uppercase tracking-widest',
                        'border transition-all duration-150',
                        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                        isSelected
                          ? 'border-accent-primary/40 text-accent-primary bg-accent-primary/10'
                          : 'border-white/5 text-text-tertiary opacity-60 hover:opacity-100',
                      )}
                    >
                      {mood.emoji && <span aria-hidden="true">{mood.emoji}</span>}
                      {mood.name}
                    </button>
                  );
                })}
              </div>
            </FormField>
          </div>

          {/* Flags */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded-sm accent-accent-primary"
              />
              <span className="font-body text-sm text-text-secondary">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="h-4 w-4 rounded-sm accent-accent-primary"
              />
              <span className="font-body text-sm text-text-secondary">Hidden (draft)</span>
            </label>
          </div>
        </div>
      )}

      {/* ── Ratings Tab ───────────────────────────────────── */}
      {activeTab === 'ratings' && (
        <div className="flex flex-col gap-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasRatings}
              onChange={(e) => setHasRatings(e.target.checked)}
              className="h-4 w-4 rounded-sm accent-accent-primary"
            />
            <span className="font-body text-sm text-text-secondary">Include ratings</span>
          </label>

          {hasRatings && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {(['overall', 'emotional', 'art', 'story', 'pacing', 'ending'] as const).map((dim) => (
                <FormField
                  key={dim}
                  label={dim.charAt(0).toUpperCase() + dim.slice(1)}
                  htmlFor={`rating-${dim}`}
                  hint={dim === 'ending' ? 'Completed only' : undefined}
                >
                  <input
                    id={`rating-${dim}`}
                    type="number"
                    min={1}
                    max={10}
                    step={0.5}
                    value={ratings[dim] ?? ''}
                    onChange={(e) =>
                      setRatings((prev) => ({
                        ...prev,
                        [dim]: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    className={inputClasses}
                    placeholder="1–10"
                  />
                </FormField>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Review Tab ────────────────────────────────────── */}
      {activeTab === 'review' && (
        <div className="flex flex-col gap-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasReview}
              onChange={(e) => setHasReview(e.target.checked)}
              className="h-4 w-4 rounded-sm accent-accent-primary"
            />
            <span className="font-body text-sm text-text-secondary">Include review</span>
          </label>

          {hasReview && (
            <>
              <FormField label="Review Body" htmlFor="review-body" required>
                <textarea
                  id="review-body"
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  className={textareaClasses}
                  placeholder="Your personal review…"
                  rows={8}
                />
              </FormField>

              <FormField label="TL;DR" htmlFor="review-tldr">
                <textarea
                  id="review-tldr"
                  value={reviewTldr}
                  onChange={(e) => setReviewTldr(e.target.value)}
                  className={textareaClasses}
                  placeholder="One paragraph summary…"
                  rows={2}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="What I Loved" htmlFor="review-loved">
                  <textarea
                    id="review-loved"
                    value={reviewWhatILoved}
                    onChange={(e) => setReviewWhatILoved(e.target.value)}
                    className={textareaClasses}
                    rows={3}
                  />
                </FormField>
                <FormField label="What I Hated" htmlFor="review-hated">
                  <textarea
                    id="review-hated"
                    value={reviewWhatIHated}
                    onChange={(e) => setReviewWhatIHated(e.target.value)}
                    className={textareaClasses}
                    rows={3}
                  />
                </FormField>
                <FormField label="Emotional Damage" htmlFor="review-damage">
                  <textarea
                    id="review-damage"
                    value={reviewEmotionalDamage}
                    onChange={(e) => setReviewEmotionalDamage(e.target.value)}
                    className={textareaClasses}
                    rows={3}
                  />
                </FormField>
                <FormField label="Would Recommend To" htmlFor="review-recommend">
                  <textarea
                    id="review-recommend"
                    value={reviewWouldRecommend}
                    onChange={(e) => setReviewWouldRecommend(e.target.value)}
                    className={textareaClasses}
                    rows={3}
                  />
                </FormField>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reviewHasSpoilers}
                  onChange={(e) => setReviewHasSpoilers(e.target.checked)}
                  className="h-4 w-4 rounded-sm accent-accent-primary"
                />
                <span className="font-body text-sm text-text-secondary">Contains spoilers</span>
              </label>
            </>
          )}
        </div>
      )}

      {/* ── Links Tab ─────────────────────────────────────── */}
      {activeTab === 'links' && (
        <div className="flex flex-col gap-4">
          {links.map((link, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-sm bg-surface-elevated/30 border border-white/10">
              <div className="flex flex-col gap-2 flex-1">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) => updateLink(i, 'platform', e.target.value)}
                    className={selectClasses}
                    aria-label="Platform"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={link.label ?? ''}
                    onChange={(e) => updateLink(i, 'label', e.target.value)}
                    className={inputClasses}
                    placeholder="Label (optional)"
                    aria-label="Link label"
                  />
                </div>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(i, 'url', e.target.value)}
                  className={inputClasses}
                  placeholder="https://…"
                  aria-label="URL"
                />
              </div>
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="p-2 text-text-tertiary hover:text-semantic-danger transition-colors focus-visible:outline-accent-primary rounded-sm mt-0.5"
                aria-label="Remove link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addLink}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-sm',
              'font-heading text-xs uppercase tracking-widest',
              'border border-dashed border-white/20 text-text-tertiary',
              'hover:border-white/30 hover:text-text-secondary transition-colors',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Link
          </button>
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
        {error && (
          <p role="alert" className="font-body text-sm text-semantic-danger flex-1">
            {error}
          </p>
        )}
        <div className="flex gap-3 ml-auto">
          <button
            type="button"
            onClick={() => router.push('/admin/titles')}
            className={cn(
              'px-4 py-2 rounded-sm font-heading text-xs uppercase tracking-widest',
              'border border-white/10 text-text-secondary',
              'hover:border-white/20 hover:text-text-primary transition-colors',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            )}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'px-5 py-2 rounded-sm font-heading text-xs uppercase tracking-widest',
              'bg-accent-primary text-white',
              'hover:brightness-110 transition-all',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                Saving…
              </span>
            ) : (
              mode === 'create' ? 'Create Title' : 'Save Changes'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
