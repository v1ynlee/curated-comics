import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import {
  studioArchiveArticle,
  studioBulkUpdateArticles,
  studioDeleteArticle,
  studioFetchAllArticles,
  studioSetArticleFeatured,
  studioSetArticlePublicationState,
} from '@/services/studio/studio-articles';
import { ArticleManagementDashboard } from '@/components/studio/articles/ArticleManagementDashboard';
import type { PublicationState } from '@/types/article';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Manage your news and editorial content.',
};

const PUBLICATION_STATES: PublicationState[] = ['draft', 'scheduled', 'published', 'archived'];
const BULK_OPERATIONS = ['draft', 'published', 'archived', 'delete'] as const;

async function fetchCategories() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('article_categories')
    .select('id, name, slug, color')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`fetchCategories: ${error.message}`);
  return data ?? [];
}

async function fetchTags() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('article_tags')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) throw new Error(`fetchTags: ${error.message}`);
  return data ?? [];
}

function parseIds(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

async function archiveArticleAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  const id = formData.get('id') as string | null;
  if (!id) return { success: false, error: 'Missing article ID.' };

  try {
    await studioArchiveArticle(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to archive article.' };
  }
}

async function deleteArticleAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  const id = formData.get('id') as string | null;
  if (!id) return { success: false, error: 'Missing article ID.' };

  try {
    await studioDeleteArticle(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete article.' };
  }
}

async function setArticleStateAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  const id = formData.get('id') as string | null;
  const publicationState = formData.get('publicationState') as PublicationState | null;

  if (!id) return { success: false, error: 'Missing article ID.' };
  if (!publicationState || !PUBLICATION_STATES.includes(publicationState)) {
    return { success: false, error: 'Invalid publication state.' };
  }

  try {
    await studioSetArticlePublicationState(id, publicationState);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update article state.' };
  }
}

async function toggleFeaturedAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  const id = formData.get('id') as string | null;
  const featured = formData.get('featured') === 'true';

  if (!id) return { success: false, error: 'Missing article ID.' };

  try {
    await studioSetArticleFeatured(id, featured);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update featured state.' };
  }
}

async function bulkArticleAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  const ids = parseIds(formData.get('ids'));
  const operation = formData.get('operation') as (typeof BULK_OPERATIONS)[number] | null;

  if (ids.length === 0) return { success: false, error: 'Select at least one article.' };
  if (!operation || !BULK_OPERATIONS.includes(operation)) {
    return { success: false, error: 'Invalid bulk operation.' };
  }

  try {
    await studioBulkUpdateArticles(ids, operation);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Bulk update failed.' };
  }
}

export default async function StudioArticlesPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const [articles, categories, tags] = await Promise.all([
    studioFetchAllArticles(),
    fetchCategories(),
    fetchTags(),
  ]);

  return (
    <div>
      <ArticleManagementDashboard
        articles={articles}
        categories={categories}
        tags={tags}
        archiveArticleAction={archiveArticleAction}
        deleteArticleAction={deleteArticleAction}
        setArticleStateAction={setArticleStateAction}
        toggleFeaturedAction={toggleFeaturedAction}
        bulkArticleAction={bulkArticleAction}
      />
    </div>
  );
}
