// ============================================================
// Studio Article Create Page — Server component that renders
// ArticleEditor in create mode with categories/tags from Supabase.
// Requirements: 13.1, 13.5
// ============================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { ArticleEditor } from '@/components/studio/articles/ArticleEditor';
import { Breadcrumbs } from '@/components/studio/Breadcrumbs';
import { studioCreateArticleCategory, studioCreateArticleTag } from '@/services/studio/studio-articles';
import { logStudioActivity } from '@/services/studio/activity-log';
import { canUseEditorialState, validateArticleWorkflow } from '@/services/studio/article-workflow';
import type { ArticleFormData } from '@/types/article';

export const metadata: Metadata = {
  title: 'New Article — Studio',
  description: 'Write a new editorial article.',
};

// ── Data fetching ───────────────────────────────────────────────

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

// ── Server action: create article ───────────────────────────────

async function createArticle(formData: ArticleFormData): Promise<void> {
  'use server';

  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const supabase = await createSupabaseServerClient();

  // Generate slug from title
  const slug = formData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // If publishing, set publish_date to now
  const publishDate =
    formData.publicationState === 'published' ? new Date().toISOString() : null;

  // Calculate word count and reading time
  const wordCount = formData.body
    .split(/\s+/)
    .filter((token) => token.length > 0).length;
  const readingTimeMinutes = wordCount === 0 ? 0 : Math.ceil(wordCount / 200);
  const workflowValidation = validateArticleWorkflow({
    ...formData,
    wordCount,
    readingTimeMinutes,
    hasFeaturedImage: Boolean(formData.featuredImageId),
  });

  if (!canUseEditorialState(formData.editorialState, workflowValidation)) {
    throw new Error(`Article is not ready for ${formData.editorialState.replace(/_/g, ' ')}: ${workflowValidation.failedChecks.map((check) => check.label).join(', ')}.`);
  }

  // Insert article row
  const { data: articleData, error: articleError } = await supabase
    .from('articles')
    .insert({
      slug,
      title: formData.title,
      subtitle: formData.subtitle ?? null,
      body: formData.body,
      excerpt: formData.excerpt ?? null,
      featured_image_id: formData.featuredImageId ?? null,
      category_id: formData.categoryId ?? null,
      publication_state: formData.publicationState,
      editorial_state: formData.editorialState,
      publish_date: publishDate,
      scheduled_date: formData.scheduledDate ?? null,
      seo_title: formData.seoTitle ?? null,
      seo_description: formData.seoDescription ?? null,
      word_count: wordCount,
      reading_time_minutes: readingTimeMinutes,
    })
    .select('id, title')
    .single();

  if (articleError) {
    throw new Error(`Failed to create article: ${articleError.message}`);
  }

  const articleId = (articleData as { id: string }).id;

  // Insert tag assignments
  if (formData.tagIds.length > 0) {
    const { error: tagError } = await supabase
      .from('article_tag_assignments')
      .insert(
        formData.tagIds.map((tag_id) => ({ article_id: articleId, tag_id })),
      );
    if (tagError) {
      console.error('Failed to insert tag assignments:', tagError);
    }
  }

  await logStudioActivity({
    eventType: 'ARTICLE_CREATED',
    entityType: 'article',
    entityId: articleId,
    entityName: articleData.title,
    metadata: {
      newValues: {
        slug,
        title: formData.title,
        publicationState: formData.publicationState,
        editorialState: formData.editorialState,
        scheduledDate: formData.scheduledDate ?? null,
        wordCount,
        readingTimeMinutes,
      },
      changedFields: ['title', 'publicationState', 'editorialState', 'scheduledDate', 'wordCount', 'readingTimeMinutes'],
    },
  });

  redirect(`/studio/articles/${slug}`);
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

export default async function StudioArticleNewPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const [categories, tags] = await Promise.all([fetchCategories(), fetchTags()]);

  return (
    <div className="container-content max-w-7xl py-8 md:py-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Studio', href: '/studio' },
          { label: 'Articles', href: '/studio/articles' },
          { label: 'New Article' },
        ]}
      />

      {/* Header */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
          New Article
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary">
          Draft, schedule, and publish editorial coverage for the public news archive.
        </p>
      </div>

      {/* Editor */}
      <ArticleEditor
        mode="create"
        saveAction={createArticle}
        createCategoryAction={createCategoryAction}
        createTagAction={createTagAction}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
