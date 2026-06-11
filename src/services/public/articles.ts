// ============================================================
// Article Service — Public Supabase queries for articles
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
//
// Provides functions to query published articles, categories,
// and tags for the public News/Editorial section.
// ============================================================

import { supabase } from '../api';
import type {
  Article,
  ArticleSummary,
  ArticleCategory,
  ArticleTag,
} from '@/types/article';
import type { MediaAsset, MediaVariant } from '@/types/media';

// ── Row shapes returned by Supabase ──────────────────────────

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  body: string;
  excerpt: string | null;
  featured_image_id: string | null;
  category_id: string | null;
  publication_state: string;
  editorial_state?: string | null;
  publish_date: string | null;
  scheduled_date: string | null;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  word_count: number;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
  // Joined relations
  article_categories: CategoryRow | null;
  media_assets: MediaAssetRow | null;
  article_tag_assignments: { article_tags: TagRow }[];
}

interface ArticleSummaryRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  publish_date: string;
  reading_time_minutes: number;
  featured: boolean;
  article_categories: CategoryRow | null;
  media_assets: MediaAssetRow | null;
  article_tag_assignments: { article_tags: TagRow }[];
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  sort_order: number;
}

interface TagRow {
  id: string;
  name: string;
  slug: string;
}

interface MediaAssetRow {
  id: string;
  slug: string;
  asset_type: string;
  content_hash: string;
  original_width: number;
  original_height: number;
  aspect_ratio: number;
  mime_type: string;
  dominant_color: string;
  blur_data_uri: string;
  variants: MediaVariant[];
  r2_base_path: string;
  created_at: string;
  updated_at: string;
}

// ── Mappers ──────────────────────────────────────────────────

function mapMediaAsset(row: MediaAssetRow): MediaAsset {
  return {
    id: row.id,
    slug: row.slug,
    assetType: row.asset_type as MediaAsset['assetType'],
    contentHash: row.content_hash,
    originalWidth: row.original_width,
    originalHeight: row.original_height,
    aspectRatio: row.aspect_ratio,
    mimeType: row.mime_type,
    dominantColor: row.dominant_color,
    blurDataUri: row.blur_data_uri,
    variants: row.variants ?? [],
    r2BasePath: row.r2_base_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapArticle(row: ArticleRow): Article {
  const tags: ArticleTag[] = (row.article_tag_assignments ?? []).map((ta) => ({
    id: ta.article_tags.id,
    name: ta.article_tags.name,
    slug: ta.article_tags.slug,
  }));

  const category: ArticleCategory | null = row.article_categories
    ? {
        id: row.article_categories.id,
        name: row.article_categories.name,
        slug: row.article_categories.slug,
        description: row.article_categories.description,
        color: row.article_categories.color,
        sortOrder: row.article_categories.sort_order,
      }
    : null;

  const featuredImage: MediaAsset | null = row.media_assets
    ? mapMediaAsset(row.media_assets)
    : null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    body: row.body,
    excerpt: row.excerpt,
    featuredImage: featuredImage,
    category: category,
    tags,
    publicationState: row.publication_state as Article['publicationState'],
    editorialState: (row.editorial_state ?? row.publication_state) as Article['editorialState'],
    publishDate: row.publish_date,
    scheduledDate: row.scheduled_date,
    featured: row.featured,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    wordCount: row.word_count,
    readingTimeMinutes: row.reading_time_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapArticleSummary(row: ArticleSummaryRow): ArticleSummary {
  const category = row.article_categories
    ? {
        name: row.article_categories.name,
        slug: row.article_categories.slug,
        color: row.article_categories.color ?? '',
      }
    : null;

  const tags: ArticleTag[] = (row.article_tag_assignments ?? []).map((ta) => ({
    id: ta.article_tags.id,
    name: ta.article_tags.name,
    slug: ta.article_tags.slug,
  }));

  const featuredImage = row.media_assets
    ? {
        url: row.media_assets.variants?.[0]?.url ?? '',
        blurDataUri: row.media_assets.blur_data_uri,
        dominantColor: row.media_assets.dominant_color,
      }
    : null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    featuredImage,
    category,
    tags,
    publishDate: row.publish_date,
    readingTimeMinutes: row.reading_time_minutes,
    featured: row.featured,
  };
}

function normalizeSearchQuery(search?: string): string | null {
  const normalized = search
    ?.replace(/[%_,()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

  return normalized || null;
}

function buildSearchFilter(searchTerm: string): string {
  return [
    `title.ilike.%${searchTerm}%`,
    `subtitle.ilike.%${searchTerm}%`,
    `excerpt.ilike.%${searchTerm}%`,
    `body.ilike.%${searchTerm}%`,
  ].join(',');
}

// ── Select fragments ─────────────────────────────────────────

const ARTICLE_SUMMARY_SELECT = `
  id,
  slug,
  title,
  subtitle,
  excerpt,
  publish_date,
  reading_time_minutes,
  featured,
  article_categories ( id, name, slug, color ),
  media_assets:featured_image_id ( id, slug, asset_type, content_hash, original_width, original_height, aspect_ratio, mime_type, dominant_color, blur_data_uri, variants, r2_base_path, created_at, updated_at ),
  article_tag_assignments ( article_tags ( id, name, slug ) )
`;

const ARTICLE_FULL_SELECT = `
  *,
  article_categories ( id, name, slug, description, color, sort_order ),
  media_assets:featured_image_id ( id, slug, asset_type, content_hash, original_width, original_height, aspect_ratio, mime_type, dominant_color, blur_data_uri, variants, r2_base_path, created_at, updated_at ),
  article_tag_assignments ( article_tags ( id, name, slug ) )
`;

// ── Public API ───────────────────────────────────────────────

export const NEWS_PAGE_SIZE = 9;

export type ArticleSort = 'latest' | 'newest' | 'popular';

export function normalizeArticleSort(sort?: string | null): ArticleSort {
  return sort === 'newest' || sort === 'popular' ? sort : 'latest';
}

export interface FetchPublishedArticlesOptions {
  category?: string;
  tag?: string;
  search?: string;
  sort?: ArticleSort;
  limit?: number;
  offset?: number;
}

/**
 * Fetch published articles with optional category/tag filters and pagination.
 * Results are sorted by publish_date DESC (newest first).
 * RLS ensures only published articles are returned.
 */
export async function fetchPublishedArticles(
  options: FetchPublishedArticlesOptions = {},
): Promise<ArticleSummary[]> {
  const { category, tag, search, sort = 'latest', limit = 20, offset = 0 } = options;
  const searchTerm = normalizeSearchQuery(search);
  const articleSort = normalizeArticleSort(sort);

  // If filtering by tag, we need a different query approach
  if (tag) {
    return fetchPublishedArticlesByTag(tag, { category, search, sort: articleSort, limit, offset });
  }

  let query = supabase
    .from('articles')
    .select(ARTICLE_SUMMARY_SELECT)
    .eq('publication_state', 'published');

  // Category filter: join article_categories and filter by slug
  if (category) {
    query = query.eq('article_categories.slug', category);
    // Use inner join behavior by filtering on the relation
    query = supabase
      .from('articles')
      .select(`
        id,
        slug,
        title,
        subtitle,
        excerpt,
        publish_date,
        reading_time_minutes,
        featured,
        article_categories!inner ( id, name, slug, color ),
        media_assets:featured_image_id ( id, slug, asset_type, content_hash, original_width, original_height, aspect_ratio, mime_type, dominant_color, blur_data_uri, variants, r2_base_path, created_at, updated_at ),
        article_tag_assignments ( article_tags ( id, name, slug ) )
      `)
      .eq('publication_state', 'published')
      .eq('article_categories.slug', category);
  }

  if (searchTerm) {
    query = query.or(buildSearchFilter(searchTerm));
  }

  if (articleSort === 'newest') {
    query = query.order('created_at', { ascending: false }).order('publish_date', { ascending: false });
  } else if (articleSort === 'popular') {
    query = query
      .order('featured', { ascending: false })
      .order('reading_time_minutes', { ascending: false })
      .order('publish_date', { ascending: false });
  } else {
    query = query.order('publish_date', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    throw new Error(`fetchPublishedArticles: ${error.message}`);
  }

  return (data as unknown as ArticleSummaryRow[]).map(mapArticleSummary);
}

/**
 * Internal helper: fetch published articles filtered by tag slug.
 * Uses the article_tag_assignments junction table.
 */
async function fetchPublishedArticlesByTag(
  tagSlug: string,
  options: { category?: string; search?: string; sort: ArticleSort; limit: number; offset: number },
): Promise<ArticleSummary[]> {
  const { category, search, sort, limit, offset } = options;
  const searchTerm = normalizeSearchQuery(search);

  // First, get article IDs that have the specified tag
  const { data: tagData, error: tagError } = await supabase
    .from('article_tag_assignments')
    .select('article_id, article_tags!inner ( slug )')
    .eq('article_tags.slug', tagSlug);

  if (tagError) {
    throw new Error(`fetchPublishedArticlesByTag: ${tagError.message}`);
  }

  if (!tagData || tagData.length === 0) return [];

  const articleIds = (tagData as unknown as { article_id: string }[]).map(
    (row) => row.article_id,
  );

  // Now fetch the articles with those IDs
  let query = supabase
    .from('articles')
    .select(ARTICLE_SUMMARY_SELECT)
    .eq('publication_state', 'published')
    .in('id', articleIds);

  if (category) {
    query = supabase
      .from('articles')
      .select(`
        id,
        slug,
        title,
        subtitle,
        excerpt,
        publish_date,
        reading_time_minutes,
        featured,
        article_categories!inner ( id, name, slug, color ),
        media_assets:featured_image_id ( id, slug, asset_type, content_hash, original_width, original_height, aspect_ratio, mime_type, dominant_color, blur_data_uri, variants, r2_base_path, created_at, updated_at ),
        article_tag_assignments ( article_tags ( id, name, slug ) )
      `)
      .eq('publication_state', 'published')
      .in('id', articleIds)
      .eq('article_categories.slug', category);
  }

  if (searchTerm) {
    query = query.or(buildSearchFilter(searchTerm));
  }

  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false }).order('publish_date', { ascending: false });
  } else if (sort === 'popular') {
    query = query
      .order('featured', { ascending: false })
      .order('reading_time_minutes', { ascending: false })
      .order('publish_date', { ascending: false });
  } else {
    query = query.order('publish_date', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    throw new Error(`fetchPublishedArticlesByTag: ${error.message}`);
  }

  return (data as unknown as ArticleSummaryRow[]).map(mapArticleSummary);
}

/**
 * Fetch a single article by slug with full data including
 * joined category, tags, and featured image media asset.
 * Returns null if not found.
 */
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_FULL_SELECT)
    .eq('slug', slug)
    .eq('publication_state', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`fetchArticleBySlug: ${error.message}`);
  }

  return mapArticle(data as unknown as ArticleRow);
}

/**
 * Fetch featured articles (featured = true AND publication_state = 'published').
 * Sorted by publish_date DESC.
 */
export async function fetchFeaturedArticles(limit = 2): Promise<ArticleSummary[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SUMMARY_SELECT)
    .eq('publication_state', 'published')
    .eq('featured', true)
    .order('publish_date', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`fetchFeaturedArticles: ${error.message}`);
  }

  return (data as unknown as ArticleSummaryRow[]).map(mapArticleSummary);
}

/**
 * Fetch all article categories sorted by sort_order.
 */
export async function fetchArticleCategories(): Promise<ArticleCategory[]> {
  const { data, error } = await supabase
    .from('article_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`fetchArticleCategories: ${error.message}`);
  }

  return (data as unknown as CategoryRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    color: row.color,
    sortOrder: row.sort_order,
  }));
}

/**
 * Count published articles (for pagination).
 * Returns the total number of published articles optionally filtered by category.
 */
export async function countPublishedArticles(
  options: { category?: string; tag?: string; search?: string } = {},
): Promise<number> {
  const { category, tag, search } = options;
  const searchTerm = normalizeSearchQuery(search);

  if (tag) {
    const { data: tagData } = await supabase
      .from('article_tag_assignments')
      .select('article_id, article_tags!inner ( slug )')
      .eq('article_tags.slug', tag);
    if (!tagData || tagData.length === 0) return 0;
    const ids = (tagData as unknown as { article_id: string }[]).map((r) => r.article_id);

    let q = supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('publication_state', 'published')
      .in('id', ids);

    if (category) {
      q = (supabase
        .from('articles')
        .select('id, article_categories!inner ( slug )', { count: 'exact', head: true })
        .eq('publication_state', 'published')
        .in('id', ids)
        .eq('article_categories.slug', category)) as unknown as typeof q;
    }

    if (searchTerm) {
      q = q.or(buildSearchFilter(searchTerm));
    }

    const { count } = await q;
    return count ?? 0;
  }

  let q = supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('publication_state', 'published');

  if (category) {
    q = (supabase
      .from('articles')
      .select('id, article_categories!inner ( slug )', { count: 'exact', head: true })
      .eq('publication_state', 'published')
      .eq('article_categories.slug', category)) as unknown as typeof q;
  }

  if (searchTerm) {
    q = q.or(buildSearchFilter(searchTerm));
  }

  const { count } = await q;
  return count ?? 0;
}

/**
 * Fetch all article tags.
 */
export async function fetchArticleTags(): Promise<ArticleTag[]> {
  const { data, error } = await supabase
    .from('article_tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`fetchArticleTags: ${error.message}`);
  }

  return (data as unknown as TagRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
  }));
}
