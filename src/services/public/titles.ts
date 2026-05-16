// ============================================================
// Title Service — Supabase queries
// Source of truth: docs/database/DATABASE_SCHEMA_PLANNING.md
//                  docs/architecture/CONTENT_STRUCTURE.md
// ============================================================

import { supabase } from '../api';
import type { Title, TitleRatings, Review, Genre, Mood, ExternalLink } from '@/types/title';
import type { LibraryFilters, SortOption } from '@/types/library';

// ── Row shape returned by Supabase ────────────────────────────

interface TitleRow {
  id: string;
  slug: string;
  title_english: string;
  title_original: string | null;
  title_alternative: string[] | null;
  origin: string;
  series_status: string;
  reading_status: string;
  chapters_read: number;
  total_chapters: number | null;
  started_date: string | null;
  completed_date: string | null;
  last_read_date: string;
  reread_count: number;
  tier: string | null;
  synopsis: string | null;
  vibe_check: string | null;
  quotable_lines: string[] | null;
  cover_slug: string | null;
  banner_slug: string | null;
  dominant_color: string | null;
  author: string | null;
  artist: string | null;
  featured: boolean;
  hidden: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  ratings: RatingRow | null;
  reviews: ReviewRow | null;
  genres: { genres: GenreRow }[];
  moods: { moods: MoodRow }[];
  external_links: ExternalLinkRow[];
  tags: { tag: string }[];
}

interface RatingRow {
  overall: number;
  emotional: number;
  art: number;
  story: number;
  pacing: number;
  ending: number | null;
}

interface ReviewRow {
  id: string;
  body: string;
  tldr: string | null;
  what_i_loved: string | null;
  what_i_hated: string | null;
  emotional_damage: string | null;
  would_recommend_to: string | null;
  has_spoilers: boolean;
  spoiler_sections: string[] | null;
  word_count: number;
  written_date: string;
  last_edited: string | null;
}

interface GenreRow {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  icon: string | null;
}

interface MoodRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  emoji: string | null;
  atmosphere: {
    gradient: string[];
    accentColor: string;
    particleColor?: string;
  };
}

interface ExternalLinkRow {
  platform: string;
  url: string;
  label: string | null;
}

// ── Mapper ────────────────────────────────────────────────────

function mapTitle(row: TitleRow): Title {
  const ratings: TitleRatings | undefined = row.ratings
    ? {
        overall: row.ratings.overall,
        emotional: row.ratings.emotional,
        art: row.ratings.art,
        story: row.ratings.story,
        pacing: row.ratings.pacing,
        ending: row.ratings.ending ?? undefined,
      }
    : undefined;

  const review: Review | undefined = row.reviews
    ? {
        id: row.id,
        titleId: row.id,
        body: row.reviews.body,
        tldr: row.reviews.tldr ?? undefined,
        whatILoved: row.reviews.what_i_loved ?? undefined,
        whatIHated: row.reviews.what_i_hated ?? undefined,
        emotionalDamage: row.reviews.emotional_damage ?? undefined,
        wouldRecommendTo: row.reviews.would_recommend_to ?? undefined,
        hasSpoilers: row.reviews.has_spoilers,
        spoilerSections: row.reviews.spoiler_sections ?? undefined,
        wordCount: row.reviews.word_count,
        writtenDate: row.reviews.written_date,
        lastEdited: row.reviews.last_edited ?? undefined,
      }
    : undefined;

  const genres: Genre[] = (row.genres ?? []).map((tg) => ({
    id: tg.genres.id,
    name: tg.genres.name,
    slug: tg.genres.slug,
    color: tg.genres.color,
    description: tg.genres.description ?? undefined,
    icon: tg.genres.icon ?? undefined,
  }));

  const moods: Mood[] = (row.moods ?? []).map((tm) => ({
    id: tm.moods.id,
    name: tm.moods.name,
    slug: tm.moods.slug,
    description: tm.moods.description,
    emoji: tm.moods.emoji ?? undefined,
    atmosphere: tm.moods.atmosphere,
  }));

  const externalLinks: ExternalLink[] = (row.external_links ?? []).map((el) => ({
    platform: el.platform as ExternalLink['platform'],
    url: el.url,
    label: el.label ?? undefined,
  }));

  const coverSlug = row.cover_slug ?? row.slug;

  return {
    id: row.id,
    slug: row.slug,
    titleEnglish: row.title_english,
    titleOriginal: row.title_original ?? undefined,
    titleAlternative: row.title_alternative ?? undefined,
    origin: row.origin as Title['origin'],
    status: row.series_status as Title['status'],
    readingStatus: row.reading_status as Title['readingStatus'],
    chaptersRead: row.chapters_read,
    totalChapters: row.total_chapters ?? undefined,
    startedDate: row.started_date ?? undefined,
    completedDate: row.completed_date ?? undefined,
    lastReadDate: row.last_read_date,
    rereadCount: row.reread_count,
    tier: (row.tier as Title['tier']) ?? undefined,
    synopsis: row.synopsis ?? undefined,
    vibeCheck: row.vibe_check ?? undefined,
    quotableLines: row.quotable_lines ?? undefined,
    coverImage: {
      slug: coverSlug,
      alt: `${row.title_english} cover`,
      blurDataURL: '',
      dominantColor: row.dominant_color ?? '#1a1a2e',
      aspectRatio: 2 / 3,
      sizes: {
        sm: `/images/covers/${coverSlug}-320w.avif`,
        md: `/images/covers/${coverSlug}-640w.avif`,
        lg: `/images/covers/${coverSlug}-1200w.avif`,
      },
    },
    bannerImage: row.banner_slug
      ? {
          slug: row.banner_slug,
          alt: `${row.title_english} banner`,
          blurDataURL: '',
          dominantColor: row.dominant_color ?? '#1a1a2e',
          aspectRatio: 21 / 9,
          sizes: {
            sm: `/images/banners/${row.banner_slug}-768w.avif`,
            md: `/images/banners/${row.banner_slug}-1200w.avif`,
            lg: `/images/banners/${row.banner_slug}-1920w.avif`,
          },
        }
      : undefined,
    genres,
    moods,
    tags: (row.tags ?? []).map((t) => t.tag),
    ratings,
    review,
    externalLinks,
    author: row.author ?? undefined,
    artist: row.artist ?? undefined,
    featured: row.featured,
    hidden: row.hidden,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Select fragment (reused across queries) ───────────────────

const TITLE_SELECT = `
  *,
  ratings ( overall, emotional, art, story, pacing, ending ),
  reviews ( id, body, tldr, what_i_loved, what_i_hated, emotional_damage, would_recommend_to, has_spoilers, spoiler_sections, word_count, written_date, last_edited ),
  genres:title_genres ( genres ( id, name, slug, color, description, icon ) ),
  moods:title_moods ( moods ( id, name, slug, description, emoji, atmosphere ) ),
  external_links ( platform, url, label ),
  tags:title_tags ( tag )
`;

// ── Sort helper ───────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySort(query: any, sortBy: SortOption): any {
  switch (sortBy) {
    case 'title-asc':
      return query.order('title_english', { ascending: true });
    case 'title-desc':
      return query.order('title_english', { ascending: false });
    case 'chapters-high':
      return query.order('chapters_read', { ascending: false });
    case 'chapters-low':
      return query.order('chapters_read', { ascending: true });
    case 'date-added':
      return query.order('created_at', { ascending: false });
    case 'date-completed':
      return query.order('completed_date', { ascending: false });
    case 'reread-count':
      return query.order('reread_count', { ascending: false });
    case 'recent-read':
    default:
      return query.order('last_read_date', { ascending: false });
  }
}

// ── Public API ────────────────────────────────────────────────

export interface FetchTitlesOptions {
  filters?: LibraryFilters;
  sortBy?: SortOption;
  page?: number;
  pageSize?: number;
}

/**
 * Fetch a paginated, filtered list of titles.
 */
export async function fetchTitles({
  filters = {},
  sortBy = 'recent-read',
  page = 0,
  pageSize = 24,
}: FetchTitlesOptions = {}): Promise<{ titles: Title[]; total: number }> {
  let query = supabase
    .from('titles')
    .select(TITLE_SELECT, { count: 'exact' })
    .eq('hidden', false);

  // Status filter
  if (filters.status && filters.status.length > 0) {
    query = query.in('reading_status', filters.status);
  }

  // Origin filter
  if (filters.origin && filters.origin.length > 0) {
    query = query.in('origin', filters.origin);
  }

  // Tier filter
  if (filters.tier && filters.tier.length > 0) {
    query = query.in('tier', filters.tier);
  }

  // Featured filter
  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  // Has review filter
  if (filters.hasReview) {
    query = query.not('reviews', 'is', null);
  }

  // Full-text search
  if (filters.search && filters.search.trim()) {
    query = query.textSearch(
      'title_english',
      filters.search.trim(),
      { type: 'websearch' },
    );
  }

  // Sort
  query = applySort(query, sortBy) as typeof query;

  // Pagination
  const from = page * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(`fetchTitles: ${error.message}`);

  return {
    titles: (data as unknown as TitleRow[]).map(mapTitle),
    total: count ?? 0,
  };
}

/**
 * Fetch a single title by slug with full data.
 */
export async function fetchTitle(slug: string): Promise<Title | null> {
  const { data, error } = await supabase
    .from('titles')
    .select(TITLE_SELECT)
    .eq('slug', slug)
    .eq('hidden', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`fetchTitle: ${error.message}`);
  }

  return mapTitle(data as unknown as TitleRow);
}

/**
 * Fetch featured titles for the landing page.
 */
export async function fetchFeaturedTitles(limit = 6): Promise<Title[]> {
  const { data, error } = await supabase
    .from('titles')
    .select(TITLE_SELECT)
    .eq('hidden', false)
    .eq('featured', true)
    .order('last_read_date', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`fetchFeaturedTitles: ${error.message}`);

  return (data as unknown as TitleRow[]).map(mapTitle);
}

/**
 * Fetch related titles (same genres, excluding current).
 */
export async function fetchRelatedTitles(
  titleId: string,
  genreSlugs: string[],
  limit = 6,
): Promise<Title[]> {
  if (genreSlugs.length === 0) {
    // Fallback: recent titles
    const { data, error } = await supabase
      .from('titles')
      .select(TITLE_SELECT)
      .eq('hidden', false)
      .neq('id', titleId)
      .order('last_read_date', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`fetchRelatedTitles: ${error.message}`);
    return (data as unknown as TitleRow[]).map(mapTitle);
  }

  // Get title IDs that share genres
  const { data: genreData, error: genreError } = await supabase
    .from('title_genres')
    .select('title_id, genres!inner(slug)')
    .in('genres.slug', genreSlugs)
    .neq('title_id', titleId)
    .limit(limit * 3);

  if (genreError) throw new Error(`fetchRelatedTitles genres: ${genreError.message}`);

  const relatedIds = [
    ...new Set((genreData as { title_id: string }[]).map((r) => r.title_id)),
  ].slice(0, limit);

  if (relatedIds.length === 0) return [];

  const { data, error } = await supabase
    .from('titles')
    .select(TITLE_SELECT)
    .in('id', relatedIds)
    .eq('hidden', false);

  if (error) throw new Error(`fetchRelatedTitles titles: ${error.message}`);

  return (data as unknown as TitleRow[]).map(mapTitle);
}

/**
 * Prefetch a title by slug (for hover prefetching).
 * Returns void — caller uses queryClient.prefetchQuery.
 */
export { fetchTitle as prefetchTitleFn };
