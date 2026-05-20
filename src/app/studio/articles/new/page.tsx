// ============================================================
// Studio Article Create Page — Server component that renders
// ArticleEditor in create mode with categories/tags from Supabase.
// Requirements: 13.1, 13.5
// ============================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { ArticleEditor } from '@/components/studio/ArticleEditor';
import { Breadcrumbs } from '@/components/studio/Breadcrumbs';
import { studioCreateArticle } from '@/services/studio/studio-articles';
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
      publish_date: publishDate,
      scheduled_date: formData.scheduledDate ?? null,
      seo_title: formData.seoTitle ?? null,
      seo_description: formData.seoDescription ?? null,
      word_count: wordCount,
      reading_time_minutes: readingTimeMinutes,
    })
    .select('id')
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

  redirect(`/studio/articles/${slug}`);
}

// ── Page component ──────────────────────────────────────────────

export default async function StudioArticleNewPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const [categories, tags] = await Promise.all([fetchCategories(), fetchTags()]);

  return (
    <div className="container-content py-8 max-w-4xl">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Studio', href: '/studio' },
          { label: 'Articles', href: '/studio/articles' },
          { label: 'New Article' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
          New Article
        </h1>
        <p className="font-body text-sm text-text-secondary">
          Write and publish editorial content for your readers.
        </p>
      </div>

      {/* Editor */}
      <ArticleEditor
        mode="create"
        onSave={createArticle}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
