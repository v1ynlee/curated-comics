// ============================================================
// Studio Article Edit Page — Server component that loads existing
// article data by slug and renders ArticleEditor in edit mode.
// Requirements: 13.1, 13.5
// ============================================================

import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { ArticleEditor } from '@/components/studio/articles/ArticleEditor';
import { studioCreateArticleCategory, studioCreateArticleTag } from '@/services/studio/studio-articles';
import type { ArticleFormData } from '@/types/article';

// ── Metadata ────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('articles')
    .select('title')
    .eq('slug', slug)
    .single();

  return {
    title: data ? `Edit: ${data.title} — Studio` : 'Edit Article — Studio',
    description: 'Edit article content and metadata.',
  };
}

// ── Data fetching ───────────────────────────────────────────────

async function fetchArticle(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      slug,
      title,
      subtitle,
      body,
      excerpt,
      featured_image_id,
      category_id,
      publication_state,
      publish_date,
      scheduled_date,
      featured,
      seo_title,
      seo_description,
      word_count,
      reading_time_minutes,
      created_at,
      updated_at,
      media_assets:featured_image_id ( id, variants, dominant_color )
    `)
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

async function fetchArticleTagIds(articleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('article_tag_assignments')
    .select('tag_id')
    .eq('article_id', articleId);
  return (data ?? []).map((row) => row.tag_id);
}

async function fetchCategories() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('article_categories')
    .select('id, name, slug, color')
    .order('sort_order', { ascending: true });
  return data ?? [];
}

async function fetchTags() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('article_tags')
    .select('id, name, slug')
    .order('name', { ascending: true });
  return data ?? [];
}

// ── Server action factory: update article ────────────────────────

function createUpdateAction(articleId: string, currentSlug: string) {
  return async function updateArticle(formData: ArticleFormData): Promise<void> {
    'use server';

    const user = await getServerUser();
    if (!user) redirect('/studio/login');

    const supabase = await createSupabaseServerClient();

    // Calculate word count and reading time
    const wordCount = formData.body
      .split(/\s+/)
      .filter((token) => token.length > 0).length;
    const readingTimeMinutes = wordCount === 0 ? 0 : Math.ceil(wordCount / 200);

    // Determine publish_date based on state transition
    let publishDate: string | null = null;
    if (formData.publicationState === 'published') {
      // If transitioning to published, set publish_date to now (unless already set)
      const { data: existing } = await supabase
        .from('articles')
        .select('publish_date, publication_state')
        .eq('id', articleId)
        .single();

      if (existing?.publication_state === 'published' && existing?.publish_date) {
        // Keep existing publish date
        publishDate = existing.publish_date;
      } else if (formData.scheduledDate && existing?.publication_state === 'scheduled') {
        // Publishing a scheduled article — use scheduled_date as publish_date
        publishDate = formData.scheduledDate;
      } else {
        publishDate = new Date().toISOString();
      }
    }

    // Update article row
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        title: formData.title,
        subtitle: formData.subtitle ?? null,
        body: formData.body,
        excerpt: formData.excerpt ?? null,
        featured_image_id: formData.featuredImageId ?? null,
        category_id: formData.categoryId ?? null,
        publication_state: formData.publicationState,
        publish_date: publishDate,
        scheduled_date:
          formData.publicationState === 'scheduled'
            ? (formData.scheduledDate ?? null)
            : null,
        seo_title: formData.seoTitle ?? null,
        seo_description: formData.seoDescription ?? null,
        word_count: wordCount,
        reading_time_minutes: readingTimeMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleId);

    if (updateError) {
      throw new Error(`Failed to update article: ${updateError.message}`);
    }

    // Replace tag assignments (delete all, re-insert)
    await supabase
      .from('article_tag_assignments')
      .delete()
      .eq('article_id', articleId);

    if (formData.tagIds.length > 0) {
      const { error: tagError } = await supabase
        .from('article_tag_assignments')
        .insert(
          formData.tagIds.map((tag_id) => ({ article_id: articleId, tag_id })),
        );
      if (tagError) {
        console.error('Failed to update tag assignments:', tagError);
      }
    }

    redirect(`/studio/articles/${currentSlug}`);
  };
}

async function createCategoryAction(name: string) {
  'use server';
  const user = await getServerUser();
  if (!user) redirect('/studio/login');
  return studioCreateArticleCategory(name);
}

async function createTagAction(name: string) {
  'use server';
  const user = await getServerUser();
  if (!user) redirect('/studio/login');
  return studioCreateArticleTag(name);
}

// ── Page component ──────────────────────────────────────────────

export default async function StudioArticleEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) {
    notFound();
  }

  // Fetch related data in parallel
  const [tagIds, categories, tags] = await Promise.all([
    fetchArticleTagIds(article.id),
    fetchCategories(),
    fetchTags(),
  ]);

  // Map database row to ArticleFormData for the editor
  const initialData: ArticleFormData = {
    title: article.title,
    subtitle: article.subtitle ?? undefined,
    body: article.body,
    excerpt: article.excerpt ?? undefined,
    featuredImageId: article.featured_image_id ?? undefined,
    categoryId: article.category_id ?? undefined,
    tagIds,
    publicationState: article.publication_state,
    scheduledDate: article.scheduled_date ?? undefined,
    seoTitle: article.seo_title ?? undefined,
    seoDescription: article.seo_description ?? undefined,
  };

  const rawMediaAsset = article.media_assets as unknown;
  const mediaAsset = (Array.isArray(rawMediaAsset) ? rawMediaAsset[0] : rawMediaAsset) as {
    id: string;
    variants?: { url?: string; width?: number; format?: string }[];
    dominant_color?: string | null;
  } | null;
  const featuredVariant = mediaAsset?.variants
    ?.filter((variant) => variant.format === 'webp' && variant.url)
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]
    ?? mediaAsset?.variants?.find((variant) => variant.url);
  const initialFeaturedImage = mediaAsset
    ? {
        id: mediaAsset.id,
        url: featuredVariant?.url ?? null,
        dominantColor: mediaAsset.dominant_color ?? null,
      }
    : null;

  // Create the update action bound to this article's ID
  const updateArticle = createUpdateAction(article.id, article.slug);

  return (
    <div className="container-content max-w-7xl py-8 md:py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
          Edit: {article.title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary">
          Update article content, metadata, thumbnail, tags, and publication settings.
        </p>
      </div>

      {/* Editor */}
      <ArticleEditor
        mode="edit"
        initialData={initialData}
        initialFeaturedImage={initialFeaturedImage}
        articleSlug={article.slug}
        saveAction={updateArticle}
        createCategoryAction={createCategoryAction}
        createTagAction={createTagAction}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
