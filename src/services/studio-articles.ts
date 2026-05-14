// ============================================================
// Studio Article Service — authenticated Studio CMS operations
// Uses the server-side Supabase client for cookie-based auth.
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
// ============================================================

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { toSlug } from '@/lib/utils';
import type { ArticleFormData } from '@/types/article';
import type { StudioArticleRow } from '@/types/studio';

// ── Helpers ───────────────────────────────────────────────────

/**
 * Calculate reading time from article body text.
 * Word count is the number of whitespace-separated non-empty tokens.
 * Reading time = Math.ceil(wordCount / 200) minutes.
 */
export function calculateReadingTime(body: string): number {
  const wordCount = body.split(/\s+/).filter((token) => token.length > 0).length;
  if (wordCount === 0) return 0;
  return Math.ceil(wordCount / 200);
}

/**
 * Count whitespace-separated non-empty tokens in a string.
 */
function countWords(body: string): number {
  return body.split(/\s+/).filter((token) => token.length > 0).length;
}

// ── Service Functions ─────────────────────────────────────────

/**
 * Fetch ALL articles regardless of publication state, with category and tag data.
 * Used in the Studio article listing interface.
 */
export async function studioFetchAllArticles(): Promise<StudioArticleRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      slug,
      title,
      publication_state,
      publish_date,
      scheduled_date,
      word_count,
      reading_time_minutes,
      featured,
      created_at,
      updated_at,
      article_categories ( name )
    `)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`studioFetchAllArticles: ${error.message}`);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    publicationState: row.publication_state as StudioArticleRow['publicationState'],
    publishDate: (row.publish_date as string) ?? null,
    scheduledDate: (row.scheduled_date as string) ?? null,
    categoryName: (row.article_categories as { name: string } | null)?.name ?? null,
    wordCount: row.word_count as number,
    readingTimeMinutes: row.reading_time_minutes as number,
    featured: row.featured as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}

/**
 * Create a new article with auto-generated slug, calculated word count and reading time.
 * Inserts the article row and tag assignments.
 * Returns the new article ID.
 */
export async function studioCreateArticle(data: ArticleFormData): Promise<string> {
  const supabase = await createSupabaseServerClient();

  const slug = toSlug(data.title);
  const wordCount = countWords(data.body);
  const readingTimeMinutes = calculateReadingTime(data.body);

  // Insert article row
  const { data: articleData, error: articleError } = await supabase
    .from('articles')
    .insert({
      slug,
      title: data.title,
      subtitle: data.subtitle ?? null,
      body: data.body,
      excerpt: data.excerpt ?? null,
      featured_image_id: data.featuredImageId ?? null,
      category_id: data.categoryId ?? null,
      publication_state: data.publicationState,
      scheduled_date: data.scheduledDate ?? null,
      seo_title: data.seoTitle ?? null,
      seo_description: data.seoDescription ?? null,
      word_count: wordCount,
      reading_time_minutes: readingTimeMinutes,
    })
    .select('id')
    .single();

  if (articleError) throw new Error(`studioCreateArticle: ${articleError.message}`);
  const articleId = (articleData as { id: string }).id;

  // Insert tag assignments
  if (data.tagIds.length > 0) {
    const { error: tagError } = await supabase
      .from('article_tag_assignments')
      .insert(
        data.tagIds.map((tag_id) => ({ article_id: articleId, tag_id })),
      );
    if (tagError) throw new Error(`studioCreateArticle (tags): ${tagError.message}`);
  }

  return articleId;
}

/**
 * Partial update of an article. Recalculates word count and reading time if body is included.
 * Updates tag assignments if tagIds is included.
 */
export async function studioUpdateArticle(
  id: string,
  data: Partial<ArticleFormData>,
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  // Build update payload — only include fields that are provided
  const updatePayload: Record<string, unknown> = {};

  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.subtitle !== undefined) updatePayload.subtitle = data.subtitle ?? null;
  if (data.body !== undefined) {
    updatePayload.body = data.body;
    updatePayload.word_count = countWords(data.body);
    updatePayload.reading_time_minutes = calculateReadingTime(data.body);
  }
  if (data.excerpt !== undefined) updatePayload.excerpt = data.excerpt ?? null;
  if (data.featuredImageId !== undefined) updatePayload.featured_image_id = data.featuredImageId ?? null;
  if (data.categoryId !== undefined) updatePayload.category_id = data.categoryId ?? null;
  if (data.publicationState !== undefined) updatePayload.publication_state = data.publicationState;
  if (data.scheduledDate !== undefined) updatePayload.scheduled_date = data.scheduledDate ?? null;
  if (data.seoTitle !== undefined) updatePayload.seo_title = data.seoTitle ?? null;
  if (data.seoDescription !== undefined) updatePayload.seo_description = data.seoDescription ?? null;

  // Update article row if there are fields to update
  if (Object.keys(updatePayload).length > 0) {
    updatePayload.updated_at = new Date().toISOString();
    const { error } = await supabase
      .from('articles')
      .update(updatePayload)
      .eq('id', id);
    if (error) throw new Error(`studioUpdateArticle: ${error.message}`);
  }

  // Update tag assignments if tagIds is provided (replace all)
  if (data.tagIds !== undefined) {
    const { error: deleteError } = await supabase
      .from('article_tag_assignments')
      .delete()
      .eq('article_id', id);
    if (deleteError) throw new Error(`studioUpdateArticle (delete tags): ${deleteError.message}`);

    if (data.tagIds.length > 0) {
      const { error: insertError } = await supabase
        .from('article_tag_assignments')
        .insert(
          data.tagIds.map((tag_id) => ({ article_id: id, tag_id })),
        );
      if (insertError) throw new Error(`studioUpdateArticle (insert tags): ${insertError.message}`);
    }
  }
}

/**
 * Archive an article — sets publication_state to 'archived'.
 */
export async function studioArchiveArticle(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('articles')
    .update({
      publication_state: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(`studioArchiveArticle: ${error.message}`);
}

/**
 * Hard delete an article and its tag assignments.
 * Deletes tag assignments first, then the article row.
 */
export async function studioDeleteArticle(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  // Delete tag assignments first
  const { error: tagError } = await supabase
    .from('article_tag_assignments')
    .delete()
    .eq('article_id', id);
  if (tagError) throw new Error(`studioDeleteArticle (tags): ${tagError.message}`);

  // Delete article row
  const { error: articleError } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);
  if (articleError) throw new Error(`studioDeleteArticle: ${articleError.message}`);
}
