// ============================================================
// Studio Article Service — authenticated Studio CMS operations
// Uses the server-side Supabase client for cookie-based auth.
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
// ============================================================

import { createSupabaseServerClient } from '@/lib/db/supabase-server';
import { toSlug } from '@/lib/utils/utils';
import { logStudioActivity } from '@/services/studio/activity-log';
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

async function fetchArticleActivityContext(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('articles')
    .select('title, publication_state, editorial_state, scheduled_date, featured')
    .eq('id', id)
    .single();
  return data;
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
      subtitle,
      excerpt,
      publication_state,
      editorial_state,
      publish_date,
      scheduled_date,
      word_count,
      reading_time_minutes,
      featured,
      created_at,
      updated_at,
      article_categories ( id, name, slug ),
      media_assets:featured_image_id ( variants, dominant_color ),
      article_tag_assignments ( article_tags ( name, slug ) )
    `)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`studioFetchAllArticles: ${error.message}`);

  return (data ?? []).map((row: Record<string, unknown>) => {
    const category = row.article_categories as {
      id: string;
      name: string;
      slug: string;
    } | null;
    const media = row.media_assets as {
      variants?: { url?: string; width?: number; format?: string }[];
      dominant_color?: string | null;
    } | null;
    const assignments = row.article_tag_assignments as {
      article_tags: { name: string; slug: string } | null;
    }[] | null;
    const imageVariant = media?.variants
      ?.filter((variant) => variant.format === 'webp' && variant.url)
      .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]
      ?? media?.variants?.find((variant) => variant.url);
    const tags = (assignments ?? [])
      .map((assignment) => assignment.article_tags)
      .filter((tag): tag is { name: string; slug: string } => Boolean(tag));

    return {
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      subtitle: (row.subtitle as string) ?? null,
      excerpt: (row.excerpt as string) ?? null,
      publicationState: row.publication_state as StudioArticleRow['publicationState'],
      editorialState: (row.editorial_state as StudioArticleRow['editorialState']) ?? 'draft',
      publishDate: (row.publish_date as string) ?? null,
      scheduledDate: (row.scheduled_date as string) ?? null,
      categoryId: category?.id ?? null,
      categoryName: category?.name ?? null,
      categorySlug: category?.slug ?? null,
      tagNames: tags.map((tag) => tag.name),
      tagSlugs: tags.map((tag) => tag.slug),
      featuredImageUrl: imageVariant?.url ?? null,
      featuredImageColor: media?.dominant_color ?? null,
      wordCount: row.word_count as number,
      readingTimeMinutes: row.reading_time_minutes as number,
      featured: row.featured as boolean,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  });
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
      editorial_state: data.editorialState,
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

export async function studioCreateArticleCategory(name: string): Promise<{
  id: string;
  name: string;
  slug: string;
  color: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  const normalizedName = name.trim();
  const slug = toSlug(normalizedName);

  if (!normalizedName || !slug) throw new Error('Category name is required.');

  const { data, error } = await supabase
    .from('article_categories')
    .upsert(
      { name: normalizedName, slug, color: null, sort_order: 100 },
      { onConflict: 'slug' },
    )
    .select('id, name, slug, color')
    .single();

  if (error) throw new Error(`studioCreateArticleCategory: ${error.message}`);
  return data;
}

export async function studioCreateArticleTag(name: string): Promise<{
  id: string;
  name: string;
  slug: string;
}> {
  const supabase = await createSupabaseServerClient();
  const normalizedName = name.trim();
  const slug = toSlug(normalizedName);

  if (!normalizedName || !slug) throw new Error('Tag name is required.');

  const { data, error } = await supabase
    .from('article_tags')
    .upsert({ name: normalizedName, slug }, { onConflict: 'slug' })
    .select('id, name, slug')
    .single();

  if (error) throw new Error(`studioCreateArticleTag: ${error.message}`);
  return data;
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
  if (data.editorialState !== undefined) updatePayload.editorial_state = data.editorialState;
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
  const existing = await fetchArticleActivityContext(id);

  const { error } = await supabase
    .from('articles')
    .update({
      publication_state: 'archived',
      editorial_state: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(`studioArchiveArticle: ${error.message}`);

  await logStudioActivity({
    eventType: 'ARTICLE_UPDATED',
    entityType: 'article',
    entityId: id,
    entityName: existing?.title ?? null,
    metadata: {
      oldValues: { publicationState: existing?.publication_state ?? null, editorialState: existing?.editorial_state ?? null },
      newValues: { publicationState: 'archived', editorialState: 'archived' },
      changedFields: ['publicationState', 'editorialState'],
    },
  });
}

export async function studioSetArticlePublicationState(
  id: string,
  publicationState: StudioArticleRow['publicationState'],
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const existing = await fetchArticleActivityContext(id);
  const payload: Record<string, unknown> = {
    publication_state: publicationState,
    updated_at: new Date().toISOString(),
  };

  if (publicationState === 'published') {
    payload.editorial_state = 'published';
    payload.publish_date = new Date().toISOString();
    payload.scheduled_date = null;
  } else if (publicationState !== 'scheduled') {
    payload.scheduled_date = null;
  }

  const { error } = await supabase
    .from('articles')
    .update(payload)
    .eq('id', id);

  if (error) throw new Error(`studioSetArticlePublicationState: ${error.message}`);

  await logStudioActivity({
    eventType: publicationState === 'published' ? 'ARTICLE_PUBLISHED' : publicationState === 'scheduled' ? 'ARTICLE_SCHEDULED' : 'ARTICLE_UPDATED',
    entityType: 'article',
    entityId: id,
    entityName: existing?.title ?? null,
    metadata: {
      oldValues: {
        publicationState: existing?.publication_state ?? null,
        editorialState: existing?.editorial_state ?? null,
        scheduledDate: existing?.scheduled_date ?? null,
      },
      newValues: {
        publicationState,
        editorialState: publicationState === 'published' ? 'published' : existing?.editorial_state ?? null,
        scheduledDate: publicationState === 'scheduled' ? existing?.scheduled_date ?? null : null,
      },
      changedFields: publicationState === 'published' ? ['publicationState', 'editorialState', 'scheduledDate'] : ['publicationState', 'scheduledDate'],
    },
  });
}

export async function studioSetArticleFeatured(id: string, featured: boolean): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const existing = await fetchArticleActivityContext(id);

  const { error } = await supabase
    .from('articles')
    .update({ featured, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(`studioSetArticleFeatured: ${error.message}`);

  await logStudioActivity({
    eventType: 'ARTICLE_UPDATED',
    entityType: 'article',
    entityId: id,
    entityName: existing?.title ?? null,
    metadata: {
      oldValues: { featured: existing?.featured ?? null },
      newValues: { featured },
      changedFields: ['featured'],
    },
  });
}

export async function studioBulkUpdateArticles(
  ids: string[],
  operation: 'draft' | 'published' | 'archived' | 'delete',
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));

  if (uniqueIds.length === 0) return;

  if (operation === 'delete') {
    const { error: tagError } = await supabase
      .from('article_tag_assignments')
      .delete()
      .in('article_id', uniqueIds);
    if (tagError) throw new Error(`studioBulkUpdateArticles (tags): ${tagError.message}`);

    const { error } = await supabase
      .from('articles')
      .delete()
      .in('id', uniqueIds);
    if (error) throw new Error(`studioBulkUpdateArticles (delete): ${error.message}`);
    return;
  }

  const payload: Record<string, unknown> = {
    publication_state: operation,
    updated_at: new Date().toISOString(),
  };

  if (operation === 'published') {
    payload.editorial_state = 'published';
    payload.publish_date = new Date().toISOString();
    payload.scheduled_date = null;
  } else {
    if (operation === 'archived') payload.editorial_state = 'archived';
    if (operation === 'draft') payload.editorial_state = 'draft';
    payload.scheduled_date = null;
  }

  const { error } = await supabase
    .from('articles')
    .update(payload)
    .in('id', uniqueIds);

  if (error) throw new Error(`studioBulkUpdateArticles: ${error.message}`);
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
