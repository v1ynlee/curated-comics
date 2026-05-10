// ============================================================
// Admin Service — authenticated CRUD operations
// All functions require an authenticated Supabase session.
// Source of truth: docs/database/DATABASE_SCHEMA_PLANNING.md
// ============================================================

import { supabase } from './api';
import { toSlug } from '@/lib/utils';
import type { TierLevel, ReadingStatus, Origin, SeriesStatus, ExternalPlatform } from '@/types/title';

// ── Types ─────────────────────────────────────────────────────

export interface TitleFormData {
  titleEnglish: string;
  titleOriginal?: string;
  origin: Origin;
  seriesStatus: SeriesStatus;
  readingStatus: ReadingStatus;
  chaptersRead: number;
  totalChapters?: number;
  tier?: TierLevel;
  synopsis?: string;
  vibeCheck?: string;
  quotableLines?: string[];
  featured: boolean;
  hidden: boolean;
  coverSlug?: string;
  dominantColor?: string;
  genreIds: string[];
  moodIds: string[];
  tags: string[];
}

export interface RatingFormData {
  overall: number;
  emotional: number;
  art: number;
  story: number;
  pacing: number;
  ending?: number;
}

export interface ReviewFormData {
  body: string;
  tldr?: string;
  whatILoved?: string;
  whatIHated?: string;
  emotionalDamage?: string;
  wouldRecommendTo?: string;
  hasSpoilers: boolean;
}

export interface ExternalLinkFormData {
  platform: ExternalPlatform;
  url: string;
  label?: string;
}

export interface AdminTitleRow {
  id: string;
  slug: string;
  title_english: string;
  origin: string;
  reading_status: string;
  chapters_read: number;
  tier: string | null;
  featured: boolean;
  hidden: boolean;
  updated_at: string;
}

// ── Title CRUD ────────────────────────────────────────────────

/**
 * Fetch all titles for the admin list (lightweight — no joins).
 */
export async function adminFetchTitles(): Promise<AdminTitleRow[]> {
  const { data, error } = await supabase
    .from('titles')
    .select('id, slug, title_english, origin, reading_status, chapters_read, tier, featured, hidden, updated_at')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`adminFetchTitles: ${error.message}`);
  return data as AdminTitleRow[];
}

/**
 * Create a new title with all related data.
 */
export async function adminCreateTitle(
  form: TitleFormData,
  ratings?: RatingFormData,
  review?: ReviewFormData,
  links?: ExternalLinkFormData[],
): Promise<string> {
  const slug = toSlug(form.titleEnglish);

  // 1. Insert title
  const { data: titleData, error: titleError } = await supabase
    .from('titles')
    .insert({
      slug,
      title_english: form.titleEnglish,
      title_original: form.titleOriginal ?? null,
      origin: form.origin,
      series_status: form.seriesStatus,
      reading_status: form.readingStatus,
      chapters_read: form.chaptersRead,
      total_chapters: form.totalChapters ?? null,
      tier: form.tier ?? null,
      synopsis: form.synopsis ?? null,
      vibe_check: form.vibeCheck ?? null,
      quotable_lines: form.quotableLines?.length ? form.quotableLines : null,
      featured: form.featured,
      hidden: form.hidden,
      cover_slug: form.coverSlug ?? null,
      dominant_color: form.dominantColor ?? null,
    })
    .select('id')
    .single();

  if (titleError) throw new Error(`adminCreateTitle: ${titleError.message}`);
  const titleId = (titleData as { id: string }).id;

  // 2. Insert related data in parallel
  await Promise.all([
    // Genres
    form.genreIds.length > 0
      ? supabase.from('title_genres').insert(
          form.genreIds.map((genre_id) => ({ title_id: titleId, genre_id })),
        )
      : Promise.resolve(),

    // Moods
    form.moodIds.length > 0
      ? supabase.from('title_moods').insert(
          form.moodIds.map((mood_id) => ({ title_id: titleId, mood_id })),
        )
      : Promise.resolve(),

    // Tags
    form.tags.length > 0
      ? supabase.from('title_tags').insert(
          form.tags.map((tag) => ({ title_id: titleId, tag })),
        )
      : Promise.resolve(),

    // Ratings
    ratings
      ? supabase.from('ratings').insert({
          title_id: titleId,
          overall: ratings.overall,
          emotional: ratings.emotional,
          art: ratings.art,
          story: ratings.story,
          pacing: ratings.pacing,
          ending: ratings.ending ?? null,
        })
      : Promise.resolve(),

    // Review
    review
      ? supabase.from('reviews').insert({
          title_id: titleId,
          body: review.body,
          tldr: review.tldr ?? null,
          what_i_loved: review.whatILoved ?? null,
          what_i_hated: review.whatIHated ?? null,
          emotional_damage: review.emotionalDamage ?? null,
          would_recommend_to: review.wouldRecommendTo ?? null,
          has_spoilers: review.hasSpoilers,
          word_count: review.body.split(/\s+/).filter(Boolean).length,
        })
      : Promise.resolve(),

    // External links
    links && links.length > 0
      ? supabase.from('external_links').insert(
          links.map((l) => ({
            title_id: titleId,
            platform: l.platform,
            url: l.url,
            label: l.label ?? null,
          })),
        )
      : Promise.resolve(),
  ]);

  return slug;
}

/**
 * Update an existing title.
 */
export async function adminUpdateTitle(
  titleId: string,
  form: Partial<TitleFormData>,
  ratings?: RatingFormData,
  review?: ReviewFormData,
  links?: ExternalLinkFormData[],
): Promise<void> {
  // 1. Update title fields
  const updatePayload: Record<string, unknown> = {};
  if (form.titleEnglish !== undefined) updatePayload.title_english = form.titleEnglish;
  if (form.titleOriginal !== undefined) updatePayload.title_original = form.titleOriginal ?? null;
  if (form.origin !== undefined) updatePayload.origin = form.origin;
  if (form.seriesStatus !== undefined) updatePayload.series_status = form.seriesStatus;
  if (form.readingStatus !== undefined) updatePayload.reading_status = form.readingStatus;
  if (form.chaptersRead !== undefined) updatePayload.chapters_read = form.chaptersRead;
  if (form.totalChapters !== undefined) updatePayload.total_chapters = form.totalChapters ?? null;
  if (form.tier !== undefined) updatePayload.tier = form.tier ?? null;
  if (form.synopsis !== undefined) updatePayload.synopsis = form.synopsis ?? null;
  if (form.vibeCheck !== undefined) updatePayload.vibe_check = form.vibeCheck ?? null;
  if (form.quotableLines !== undefined) updatePayload.quotable_lines = form.quotableLines?.length ? form.quotableLines : null;
  if (form.featured !== undefined) updatePayload.featured = form.featured;
  if (form.hidden !== undefined) updatePayload.hidden = form.hidden;
  if (form.coverSlug !== undefined) updatePayload.cover_slug = form.coverSlug ?? null;
  if (form.dominantColor !== undefined) updatePayload.dominant_color = form.dominantColor ?? null;

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await supabase
      .from('titles')
      .update(updatePayload)
      .eq('id', titleId);
    if (error) throw new Error(`adminUpdateTitle: ${error.message}`);
  }

  // 2. Update genres (replace all)
  if (form.genreIds !== undefined) {
    await supabase.from('title_genres').delete().eq('title_id', titleId);
    if (form.genreIds.length > 0) {
      await supabase.from('title_genres').insert(
        form.genreIds.map((genre_id) => ({ title_id: titleId, genre_id })),
      );
    }
  }

  // 3. Update moods (replace all)
  if (form.moodIds !== undefined) {
    await supabase.from('title_moods').delete().eq('title_id', titleId);
    if (form.moodIds.length > 0) {
      await supabase.from('title_moods').insert(
        form.moodIds.map((mood_id) => ({ title_id: titleId, mood_id })),
      );
    }
  }

  // 4. Update tags (replace all)
  if (form.tags !== undefined) {
    await supabase.from('title_tags').delete().eq('title_id', titleId);
    if (form.tags.length > 0) {
      await supabase.from('title_tags').insert(
        form.tags.map((tag) => ({ title_id: titleId, tag })),
      );
    }
  }

  // 5. Upsert ratings
  if (ratings) {
    await supabase.from('ratings').upsert(
      {
        title_id: titleId,
        overall: ratings.overall,
        emotional: ratings.emotional,
        art: ratings.art,
        story: ratings.story,
        pacing: ratings.pacing,
        ending: ratings.ending ?? null,
      },
      { onConflict: 'title_id' },
    );
  }

  // 6. Upsert review
  if (review) {
    await supabase.from('reviews').upsert(
      {
        title_id: titleId,
        body: review.body,
        tldr: review.tldr ?? null,
        what_i_loved: review.whatILoved ?? null,
        what_i_hated: review.whatIHated ?? null,
        emotional_damage: review.emotionalDamage ?? null,
        would_recommend_to: review.wouldRecommendTo ?? null,
        has_spoilers: review.hasSpoilers,
        word_count: review.body.split(/\s+/).filter(Boolean).length,
        last_edited: new Date().toISOString(),
      },
      { onConflict: 'title_id' },
    );
  }

  // 7. Replace external links
  if (links !== undefined) {
    await supabase.from('external_links').delete().eq('title_id', titleId);
    if (links.length > 0) {
      await supabase.from('external_links').insert(
        links.map((l) => ({
          title_id: titleId,
          platform: l.platform,
          url: l.url,
          label: l.label ?? null,
        })),
      );
    }
  }
}

/**
 * Delete a title and all related data (cascade handled by DB).
 */
export async function adminDeleteTitle(titleId: string): Promise<void> {
  const { error } = await supabase.from('titles').delete().eq('id', titleId);
  if (error) throw new Error(`adminDeleteTitle: ${error.message}`);
}

/**
 * Update reading progress for a title.
 */
export async function adminUpdateProgress(
  titleId: string,
  chaptersRead: number,
  readingStatus?: ReadingStatus,
): Promise<void> {
  const update: Record<string, unknown> = {
    chapters_read: chaptersRead,
    last_read_date: new Date().toISOString(),
  };
  if (readingStatus) update.reading_status = readingStatus;

  const { error } = await supabase.from('titles').update(update).eq('id', titleId);
  if (error) throw new Error(`adminUpdateProgress: ${error.message}`);
}

/**
 * Bulk update reading status for multiple titles.
 */
export async function adminBulkUpdateStatus(
  titleIds: string[],
  readingStatus: ReadingStatus,
): Promise<void> {
  const { error } = await supabase
    .from('titles')
    .update({ reading_status: readingStatus })
    .in('id', titleIds);
  if (error) throw new Error(`adminBulkUpdateStatus: ${error.message}`);
}

/**
 * Bulk delete titles.
 */
export async function adminBulkDelete(titleIds: string[]): Promise<void> {
  const { error } = await supabase.from('titles').delete().in('id', titleIds);
  if (error) throw new Error(`adminBulkDelete: ${error.message}`);
}

/**
 * Fetch genres and moods for form selectors.
 */
export async function adminFetchFormOptions() {
  const [genresResult, moodsResult] = await Promise.all([
    supabase.from('genres').select('id, name, slug, color').order('sort_order'),
    supabase.from('moods').select('id, name, slug, emoji').order('sort_order'),
  ]);

  return {
    genres: (genresResult.data ?? []) as { id: string; name: string; slug: string; color: string }[],
    moods: (moodsResult.data ?? []) as { id: string; name: string; slug: string; emoji: string | null }[],
  };
}
