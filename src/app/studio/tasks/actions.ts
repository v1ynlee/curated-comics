'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { logStudioActivity } from '@/services/studio/activity-log';
import { EDITORIAL_STATE_LABELS, validateArticleWorkflow } from '@/services/studio/article-workflow';
import type { EditorialState } from '@/types/article';
import { fetchQAData } from '../qa/actions';
import type { QAResultItem } from '../qa/types';
import type { StudioTask, StudioTaskPriority } from './types';

interface IgnoreRow { task_key: string }
interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  excerpt: string | null;
  featured_image_id: string | null;
  category_id: string | null;
  publication_state: string;
  editorial_state: EditorialState | null;
  scheduled_date: string | null;
  word_count: number | null;
  reading_time_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
  created_at: string;
  article_tag_assignments?: { tag_id: string | null }[] | null;
}
interface CreatorRow { id: string; slug: string; name: string; description: string | null; image: string | null; status?: string | null; updated_at: string | null; created_at: string }
interface TitleCreatorRow { creator_id: string }
interface NarrativeRow { id: string; title: string; cover_slugs: string[] | null; updated_at: string }
interface TitleSlugRow { slug: string }
interface ActivityRow { id: string; event_type: string; entity_id: string | null; entity_name: string | null; metadata: Record<string, unknown> | null; created_at: string }

function qaPriority(item: QAResultItem): StudioTaskPriority {
  if (item.issueType === 'broken-featured') return 'critical';
  if (item.issueType === 'missing-covers' || item.issueType === 'missing-creators') return 'high';
  if (item.issueType === 'missing-synopsis' || item.issueType === 'missing-reading-urls') return 'medium';
  return 'low';
}

function qaTask(item: QAResultItem): StudioTask {
  return {
    id: `qa:${item.id}`,
    priority: qaPriority(item),
    source: 'qa',
    entityType: item.entityType === 'article' ? 'article' : item.entityType === 'creator' || item.entityType === 'featured-creator' ? 'creator' : item.entityType === 'media' || item.entityType === 'character' ? 'media' : item.entityType === 'narrative' ? 'narrative' : 'title',
    entityId: item.entityId,
    entityName: item.title,
    issue: item.issueLabel,
    detail: item.issueDetail ?? item.subtitle,
    createdAt: item.updatedAt,
    openHref: item.editorHref,
    resolveHref: `/studio/qa?issue=${item.issueType}`,
    assignHref: item.issueType === 'missing-creators' ? '/studio/qa?issue=missing-creators' : null,
    metadata: { qaIssueType: item.issueType, qaId: item.id },
  };
}

function lowConfidenceTask(row: ActivityRow): StudioTask | null {
  const confidence = row.metadata?.confidenceLevels;
  if (!confidence || typeof confidence !== 'object' || Array.isArray(confidence)) return null;
  const fields = Object.entries(confidence as Record<string, { confidence?: string } | null>)
    .filter(([, value]) => value?.confidence === 'low' || value?.confidence === 'medium')
    .map(([field, value]) => ({ field, confidence: value?.confidence }));
  if (fields.length === 0) return null;
  const lowCount = fields.filter((item) => item.confidence === 'low').length;

  return {
    id: `ai:${row.id}`,
    priority: lowCount > 0 ? 'medium' : 'low',
    source: 'ai',
    entityType: 'ai',
    entityId: row.entity_id,
    entityName: row.entity_name ?? 'AI suggestion',
    issue: lowCount > 0 ? 'Low confidence AI result' : 'Medium confidence AI result',
    detail: fields.map((item) => item.field).join(', '),
    createdAt: row.created_at,
    openHref: '/studio/activity?filter=ai',
    resolveHref: '/studio/activity?filter=ai',
    assignHref: null,
    metadata: { fields },
  };
}

export async function fetchStudioTasks(): Promise<StudioTask[]> {
  const user = await getServerUser();
  if (!user) throw new Error('Unauthorized');

  const supabase = await createSupabaseServerClient();
  const qaData = await fetchQAData();
  const [ignoresResult, articlesResult, creatorsResult, creatorLinksResult, narrativesResult, titleSlugsResult, activityResult] = await Promise.all([
    supabase.from('editorial_task_ignores').select('task_key'),
    supabase.from('articles').select('id, slug, title, body, excerpt, featured_image_id, category_id, publication_state, editorial_state, scheduled_date, word_count, reading_time_minutes, seo_title, seo_description, updated_at, created_at, article_tag_assignments ( tag_id )').order('updated_at', { ascending: false }),
    supabase.from('creators').select('id, slug, name, description, image, status, updated_at, created_at').order('updated_at', { ascending: false }),
    supabase.from('title_creators').select('creator_id'),
    supabase.from('featured_narratives').select('id, title, cover_slugs, updated_at').order('updated_at', { ascending: false }),
    supabase.from('titles').select('slug'),
    supabase.from('editorial_activity_log').select('id, event_type, entity_id, entity_name, metadata, created_at').in('event_type', ['AI_AUTOFILL_APPLIED', 'AI_AUTOFILL_REJECTED']).order('created_at', { ascending: false }).limit(50),
  ]);

  const ignored = new Set(((ignoresResult.data ?? []) as IgnoreRow[]).map((row) => row.task_key));
  const tasks: StudioTask[] = qaData.results.map(qaTask);

  const now = Date.now();
  for (const article of (articlesResult.data ?? []) as ArticleRow[]) {
    const editorialState = article.editorial_state ?? 'draft';
    const tagIds = (article.article_tag_assignments ?? [])
      .map((assignment) => assignment.tag_id)
      .filter((tagId): tagId is string => Boolean(tagId));
    const validation = validateArticleWorkflow({
      title: article.title,
      body: article.body ?? '',
      excerpt: article.excerpt ?? undefined,
      featuredImageId: article.featured_image_id ?? undefined,
      categoryId: article.category_id ?? undefined,
      tagIds,
      seoTitle: article.seo_title ?? undefined,
      seoDescription: article.seo_description ?? undefined,
      wordCount: article.word_count ?? undefined,
      readingTimeMinutes: article.reading_time_minutes ?? undefined,
      hasFeaturedImage: Boolean(article.featured_image_id),
    });

    if (editorialState === 'needs_edit') {
      tasks.push({
        id: `article:needs-edit:${article.id}`,
        priority: 'medium',
        source: 'article',
        entityType: 'article',
        entityId: article.id,
        entityName: article.title,
        issue: 'Article needs edit',
        detail: 'Article is marked for editorial changes.',
        createdAt: article.updated_at ?? article.created_at,
        openHref: `/studio/articles/${article.slug}`,
        resolveHref: `/studio/articles/${article.slug}`,
        assignHref: null,
      });
    }
    if (editorialState === 'ready_for_review') {
      tasks.push({
        id: `article:ready-review:${article.id}`,
        priority: 'medium',
        source: 'article',
        entityType: 'article',
        entityId: article.id,
        entityName: article.title,
        issue: 'Article ready for review',
        detail: 'Editorial review is waiting for approval or requested edits.',
        createdAt: article.updated_at ?? article.created_at,
        openHref: `/studio/articles/${article.slug}`,
        resolveHref: `/studio/articles/${article.slug}`,
        assignHref: null,
      });
    }
    if (['ready_for_review', 'approved', 'scheduled', 'published'].includes(editorialState) && !validation.readyForReview) {
      tasks.push({
        id: `article:workflow-validation:${article.id}`,
        priority: 'high',
        source: 'article',
        entityType: 'article',
        entityId: article.id,
        entityName: article.title,
        issue: 'Article workflow validation failed',
        detail: `${EDITORIAL_STATE_LABELS[editorialState]} is missing: ${validation.failedChecks.map((check) => check.label).join(', ')}.`,
        createdAt: article.updated_at ?? article.created_at,
        openHref: `/studio/articles/${article.slug}`,
        resolveHref: `/studio/articles/${article.slug}`,
        assignHref: null,
        metadata: { editorialState, failedChecks: validation.failedChecks.map((check) => check.key) },
      });
    }
    if (article.publication_state === 'scheduled' && (!article.scheduled_date || new Date(article.scheduled_date).getTime() < now)) {
      tasks.push({
        id: `article:scheduled-validation:${article.id}`,
        priority: 'critical',
        source: 'article',
        entityType: 'article',
        entityId: article.id,
        entityName: article.title,
        issue: 'Scheduled validation issue',
        detail: article.scheduled_date ? 'Scheduled date is in the past.' : 'Scheduled article is missing a scheduled date.',
        createdAt: article.updated_at ?? article.created_at,
        openHref: `/studio/articles/${article.slug}`,
        resolveHref: `/studio/articles/${article.slug}`,
        assignHref: null,
      });
    }
  }

  const creatorIdsWithTitles = new Set(((creatorLinksResult.data ?? []) as TitleCreatorRow[]).map((row) => row.creator_id));
  for (const creator of (creatorsResult.data ?? []) as CreatorRow[]) {
    if (creator.status === 'archived') continue;
    if (!creator.image) tasks.push({ id: `creator:missing-image:${creator.id}`, priority: 'low', source: 'creator', entityType: 'creator', entityId: creator.id, entityName: creator.name, issue: 'Creator missing image', detail: 'Creator profile has no image.', createdAt: creator.updated_at ?? creator.created_at, openHref: '/studio/creators', resolveHref: '/studio/creators', assignHref: null });
    if (!creator.description?.trim()) tasks.push({ id: `creator:missing-biography:${creator.id}`, priority: 'low', source: 'creator', entityType: 'creator', entityId: creator.id, entityName: creator.name, issue: 'Creator missing biography', detail: 'Creator profile has no biography.', createdAt: creator.updated_at ?? creator.created_at, openHref: '/studio/creators', resolveHref: '/studio/creators', assignHref: null });
    if (!creatorIdsWithTitles.has(creator.id)) tasks.push({ id: `creator:missing-relationships:${creator.id}`, priority: 'medium', source: 'creator', entityType: 'creator', entityId: creator.id, entityName: creator.name, issue: 'Creator missing title relationships', detail: 'Creator is not linked to any title.', createdAt: creator.updated_at ?? creator.created_at, openHref: '/studio/creators', resolveHref: '/studio/creators', assignHref: '/studio/creators' });
  }

  const titleSlugs = new Set(((titleSlugsResult.data ?? []) as TitleSlugRow[]).map((row) => row.slug));
  for (const narrative of (narrativesResult.data ?? []) as NarrativeRow[]) {
    const slugs = narrative.cover_slugs ?? [];
    const broken = slugs.filter((slug) => !titleSlugs.has(slug));
    if (slugs.length < 4 || slugs.length > 6 || broken.length > 0) {
      tasks.push({
        id: `narrative:validation:${narrative.id}`,
        priority: broken.length > 0 ? 'high' : 'medium',
        source: 'narrative',
        entityType: 'narrative',
        entityId: narrative.id,
        entityName: narrative.title,
        issue: 'Narrative validation failed',
        detail: broken.length > 0 ? `Broken references: ${broken.join(', ')}` : `${slugs.length} selected titles; expected 4-6.`,
        createdAt: narrative.updated_at,
        openHref: '/studio/curation',
        resolveHref: '/studio/qa?issue=broken-featured',
        assignHref: null,
        metadata: { coverSlugs: slugs, broken },
      });
    }
  }

  for (const row of (activityResult.data ?? []) as ActivityRow[]) {
    const task = lowConfidenceTask(row);
    if (task) tasks.push(task);
  }

  return tasks
    .filter((task) => !ignored.has(task.id))
    .sort((a, b) => {
      const priorityOrder: Record<StudioTaskPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function ignoreStudioTask(task: Pick<StudioTask, 'id' | 'source' | 'entityType' | 'entityId' | 'entityName'>, reason?: string) {
  const user = await getServerUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('editorial_task_ignores').upsert({
    task_key: task.id,
    task_type: task.source,
    entity_type: task.entityType,
    entity_id: task.entityId,
    entity_name: task.entityName,
    reason: reason?.trim() || null,
    actor_id: user.id,
  }, { onConflict: 'task_key' });

  if (error) return { success: false, error: error.message };

  await logStudioActivity({
    eventType: 'QA_ACTION_APPLIED',
    entityType: 'qa',
    entityId: task.entityId,
    entityName: task.entityName,
    metadata: { action: 'ignore-task', taskId: task.id, taskSource: task.source, reason: reason?.trim() || null },
  });

  revalidatePath('/studio/tasks');
  revalidatePath('/studio');
  return { success: true };
}
