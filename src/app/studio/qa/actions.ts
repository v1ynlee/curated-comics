'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { generateTitleAutofill, GeminiTitleGeneratorError } from '@/services/studio/gemini-title-generator';
import { logStudioActivity } from '@/services/studio/activity-log';
import { calculateTitleCompletion } from '@/services/studio/title-completion';
import type { QABulkAction, QAData, QAEntityType, QAIssueSummary, QAIssueType, QAQuickAction, QAResultItem } from './types';

interface TitleRow {
  id: string;
  slug: string;
  title_english: string;
  synopsis: string | null;
  cover_slug: string | null;
  tier?: string | null;
  hidden: boolean;
  featured: boolean;
  author?: string | null;
  artist?: string | null;
  updated_at: string;
}

interface RelationRow { title_id: string }
interface TitleCreatorRow { title_id: string; role: 'author' | 'artist' | 'studio' }
interface ReviewRow { title_id: string }
interface ArticleRow { id: string; slug: string; title: string; publication_state: string; updated_at: string }
interface CreatorRow { id: string; slug: string; name: string; status?: string | null; updated_at?: string | null }
interface FeaturedCreatorRow { creator_id: string; visible: boolean; updated_at: string }
interface NarrativeRow { id: string; title: string; cover_slugs: string[] | null; visible: boolean; updated_at: string }
interface IgnoreRow { issue_key: string }
interface GalleryRow { title_id: string }

type QAActionResult<T = undefined> = T extends undefined
  ? { success: true } | { success: false; error: string }
  : { success: true; data: T } | { success: false; error: string };

const ISSUE_META: Record<QAIssueType, Omit<QAIssueSummary, 'count'>> = {
  'missing-covers': { type: 'missing-covers', label: 'Missing Covers', description: 'Titles without a cover image assigned.' },
  'missing-synopsis': { type: 'missing-synopsis', label: 'Missing Synopsis', description: 'Titles with empty synopsis or summary content.' },
  'missing-genres': { type: 'missing-genres', label: 'Missing Genres', description: 'Titles without any genre associations.' },
  'missing-moods': { type: 'missing-moods', label: 'Missing Moods', description: 'Titles without any mood associations.' },
  'missing-creators': { type: 'missing-creators', label: 'Missing Creators', description: 'Titles without normalized creator relationships.' },
  'missing-reading-urls': { type: 'missing-reading-urls', label: 'Missing Reading URLs', description: 'Titles without external reading links.' },
  'unreviewed-titles': { type: 'unreviewed-titles', label: 'Unreviewed Titles', description: 'Titles without a saved review.' },
  'draft-content': { type: 'draft-content', label: 'Draft Content', description: 'Hidden titles, draft articles, and archived creators.' },
  'broken-featured': { type: 'broken-featured', label: 'Broken Featured', description: 'Featured/editorial records that need attention.' },
};

async function requireStudioAccess() {
  const user = await getServerUser();
  if (!user) throw new Error('Unauthorized');
  return createSupabaseServerClient();
}

function revalidateQA() {
  revalidatePath('/studio/qa');
  revalidatePath('/studio/activity');
}

async function logQAAction(action: string, item: { entityId?: string | null; entityType?: string | null; title?: string | null }, metadata?: Record<string, unknown>) {
  await logStudioActivity({
    eventType: 'QA_ACTION_APPLIED',
    entityType: 'qa',
    entityId: item.entityId ?? null,
    entityName: item.title ?? null,
    metadata: { action, entityType: item.entityType, ...metadata },
  });
}

function actionSet(issueType: QAIssueType, entityType: QAEntityType): QAQuickAction[] {
  if (issueType === 'missing-covers') return ['open-editor', 'upload-cover', 'archive-title'];
  if (issueType === 'missing-synopsis') return ['open-details-editor', 'fill-synopsis-ai', 'ignore'];
  if (issueType === 'missing-creators') return ['assign-creator', 'open-creator-manager', 'archive-title'];
  if (issueType === 'missing-reading-urls') return ['open-reading-url-manager', 'add-reading-url', 'ignore'];
  if (issueType === 'unreviewed-titles') return ['open-review-card', 'mark-reviewed'];
  if (issueType === 'broken-featured' && entityType === 'featured-title') return ['remove-featured-title', 'replace-featured-title', 'open-title'];
  if (issueType === 'broken-featured' && entityType === 'featured-creator') return ['remove-featured-creator', 'replace-featured-creator', 'archive-creator'];
  if (issueType === 'broken-featured' && entityType === 'narrative') return ['open-narrative-editor', 'auto-remove-broken-references'];
  return ['open-editor'];
}

function bulkSet(issueType: QAIssueType, entityType: QAEntityType): QABulkAction[] {
  const actions: QABulkAction[] = [];
  if (issueType === 'unreviewed-titles') actions.push('mark-reviewed');
  if (entityType === 'title' || entityType === 'creator') actions.push('archive');
  if (issueType === 'missing-synopsis' || issueType === 'missing-reading-urls') actions.push('ignore');
  if (issueType === 'broken-featured' && (entityType === 'featured-title' || entityType === 'featured-creator')) actions.push('remove-featured');
  return actions;
}

function titleIssue(title: TitleRow, issueType: QAIssueType, quickFixLabel: string, issueDetail: string | null, completionScore: number | null): QAResultItem {
  return {
    id: `${issueType}:title:${title.id}`,
    entityId: title.id,
    entityType: 'title',
    slug: title.slug,
    title: title.title_english,
    subtitle: title.slug,
    coverSlug: title.cover_slug ?? title.slug,
    issueType,
    issueLabel: ISSUE_META[issueType].label,
    issueDetail,
    updatedAt: title.updated_at,
    editorHref: `/studio/titles/${title.slug}`,
    quickFixLabel,
    quickFixHref: `/studio/titles/${title.slug}`,
    actions: actionSet(issueType, 'title'),
    bulkActions: bulkSet(issueType, 'title'),
    completionScore,
    metadata: { slug: title.slug, featured: title.featured, hidden: title.hidden },
  };
}

function genericIssue(params: {
  id: string;
  entityType: QAEntityType;
  slug?: string | null;
  title: string;
  subtitle?: string | null;
  issueType: QAIssueType;
  issueDetail?: string | null;
  updatedAt: string;
  editorHref: string;
  quickFixLabel: string;
  metadata?: Record<string, unknown>;
}): QAResultItem {
  return {
    id: `${params.issueType}:${params.entityType}:${params.id}`,
    entityId: params.id,
    entityType: params.entityType,
    slug: params.slug ?? null,
    title: params.title,
    subtitle: params.subtitle ?? null,
    coverSlug: null,
    issueType: params.issueType,
    issueLabel: ISSUE_META[params.issueType].label,
    issueDetail: params.issueDetail ?? null,
    updatedAt: params.updatedAt,
    editorHref: params.editorHref,
    quickFixLabel: params.quickFixLabel,
    quickFixHref: params.editorHref,
    actions: actionSet(params.issueType, params.entityType),
    bulkActions: bulkSet(params.issueType, params.entityType),
    metadata: params.metadata,
  };
}

async function fetchCreatorRowsWithStatus(): Promise<CreatorRow[]> {
  const supabase = await createSupabaseServerClient();
  const result = await supabase.from('creators').select('id, slug, name, status, updated_at').order('name', { ascending: true });
  if (!result.error) return (result.data ?? []) as CreatorRow[];

  const fallback = await supabase.from('creators').select('id, slug, name, updated_at').order('name', { ascending: true });
  if (fallback.error) return [];
  return (fallback.data ?? []) as CreatorRow[];
}

export async function fetchQAData(): Promise<QAData> {
  const supabase = await requireStudioAccess();

  const [
    titlesResult,
    genresResult,
    moodsResult,
    creatorsResult,
    reviewsResult,
    externalLinksResult,
    galleryResult,
    articlesResult,
    featuredCreatorsResult,
    narrativesResult,
    ignoresResult,
  ] = await Promise.all([
    supabase.from('titles').select('id, slug, title_english, synopsis, cover_slug, tier, hidden, featured, author, artist, updated_at').order('updated_at', { ascending: false }),
    supabase.from('title_genres').select('title_id'),
    supabase.from('title_moods').select('title_id'),
    supabase.from('title_creators').select('title_id, role'),
    supabase.from('reviews').select('title_id'),
    supabase.from('external_links').select('title_id'),
    supabase.from('title_gallery').select('title_id'),
    supabase.from('articles').select('id, slug, title, publication_state, updated_at'),
    supabase.from('featured_creators').select('creator_id, visible, updated_at'),
    supabase.from('featured_narratives').select('id, title, cover_slugs, visible, updated_at'),
    supabase.from('editorial_qa_ignores').select('issue_key'),
  ]);

  const creatorRows = await fetchCreatorRowsWithStatus();
  const titles = titlesResult.error ? [] : (titlesResult.data ?? []) as TitleRow[];
  const titleSlugs = new Set(titles.map((title) => title.slug));
  const titleBySlug = new Map(titles.map((title) => [title.slug, title]));
  const ignoredKeys = new Set(((ignoresResult.data ?? []) as IgnoreRow[]).map((row) => row.issue_key));

  const genresByTitle = new Set(((genresResult.data ?? []) as RelationRow[]).map((row) => row.title_id));
  const moodsByTitle = new Set(((moodsResult.data ?? []) as RelationRow[]).map((row) => row.title_id));
  const reviewsByTitle = new Set(((reviewsResult.data ?? []) as ReviewRow[]).map((row) => row.title_id));
  const linksByTitle = new Set(((externalLinksResult.data ?? []) as RelationRow[]).map((row) => row.title_id));
  const galleryByTitle = new Set(((galleryResult.data ?? []) as GalleryRow[]).map((row) => row.title_id));
  const creatorsByTitle = new Map<string, Set<string>>();

  if (!creatorsResult.error) {
    for (const row of (creatorsResult.data ?? []) as TitleCreatorRow[]) {
      const roles = creatorsByTitle.get(row.title_id) ?? new Set<string>();
      roles.add(row.role);
      creatorsByTitle.set(row.title_id, roles);
    }
  }

  const results: QAResultItem[] = [];
  const pushIssue = (issue: QAResultItem) => {
    if (!ignoredKeys.has(issue.id)) results.push(issue);
  };

  for (const title of titles) {
    const creatorRoles = creatorsByTitle.get(title.id);
    const hasLegacyCreators = Boolean(title.author?.trim() || title.artist?.trim());
    const completionScore = calculateTitleCompletion({
      coverSlug: title.cover_slug,
      synopsis: title.synopsis,
      genresCount: genresByTitle.has(title.id) ? 1 : 0,
      moodsCount: moodsByTitle.has(title.id) ? 1 : 0,
      creatorsCount: creatorRoles?.size || hasLegacyCreators ? 1 : 0,
      readingUrlsCount: linksByTitle.has(title.id) ? 1 : 0,
      hasReview: reviewsByTitle.has(title.id),
      tier: title.tier ?? null,
      galleryAssetsCount: galleryByTitle.has(title.id) ? 1 : 0,
      hidden: title.hidden,
    }).score;

    if (title.hidden) {
      pushIssue(titleIssue(title, 'draft-content', 'Open Editor', 'Title is hidden from the public site.', completionScore));
      continue;
    }
    if (!title.cover_slug) pushIssue(titleIssue(title, 'missing-covers', 'Upload Cover', null, completionScore));
    if (!title.synopsis?.trim()) pushIssue(titleIssue(title, 'missing-synopsis', 'Fill With AI', null, completionScore));
    if (!genresByTitle.has(title.id)) pushIssue(titleIssue(title, 'missing-genres', 'Add Genres', null, completionScore));
    if (!moodsByTitle.has(title.id)) pushIssue(titleIssue(title, 'missing-moods', 'Add Moods', null, completionScore));
    if ((!creatorRoles || creatorRoles.size === 0) && !hasLegacyCreators) pushIssue(titleIssue(title, 'missing-creators', 'Assign Creator', null, completionScore));
    if (!linksByTitle.has(title.id)) pushIssue(titleIssue(title, 'missing-reading-urls', 'Add Reading URL', null, completionScore));
    if (!reviewsByTitle.has(title.id)) pushIssue(titleIssue(title, 'unreviewed-titles', 'Mark Reviewed', null, completionScore));
    if (title.featured && !title.cover_slug) {
      pushIssue(genericIssue({
        id: title.id,
        entityType: 'featured-title',
        slug: title.slug,
        title: title.title_english,
        subtitle: title.slug,
        issueType: 'broken-featured',
        issueDetail: 'Featured title has no cover image.',
        updatedAt: title.updated_at,
        editorHref: `/studio/titles/${title.slug}`,
        quickFixLabel: 'Remove Featured',
        metadata: { titleId: title.id, slug: title.slug },
      }));
    }
  }

  if (!articlesResult.error) {
    for (const article of (articlesResult.data ?? []) as ArticleRow[]) {
      if (article.publication_state === 'draft') {
        pushIssue(genericIssue({ id: article.id, entityType: 'article', slug: article.slug, title: article.title, subtitle: 'Draft article', issueType: 'draft-content', updatedAt: article.updated_at, editorHref: `/studio/articles/${article.slug}`, quickFixLabel: 'Open Article' }));
      }
    }
  }

  const creatorsById = new Map(creatorRows.map((creator) => [creator.id, creator]));
  for (const creator of creatorRows) {
    if (creator.status === 'archived') {
      pushIssue(genericIssue({ id: creator.id, entityType: 'creator', slug: creator.slug, title: creator.name, subtitle: 'Archived creator', issueType: 'draft-content', updatedAt: creator.updated_at ?? new Date(0).toISOString(), editorHref: '/studio/creators', quickFixLabel: 'Open Creators' }));
    }
  }

  if (!featuredCreatorsResult.error) {
    for (const featured of (featuredCreatorsResult.data ?? []) as FeaturedCreatorRow[]) {
      const creator = creatorsById.get(featured.creator_id);
      if (!creator || creator.status === 'archived') {
        pushIssue(genericIssue({
          id: featured.creator_id,
          entityType: 'featured-creator',
          slug: creator?.slug ?? null,
          title: creator?.name ?? 'Missing featured creator',
          subtitle: creator?.status === 'archived' ? 'Featured creator is archived' : 'Featured creator record is missing',
          issueType: 'broken-featured',
          issueDetail: creator?.status === 'archived' ? 'Archived creators should not be featured.' : 'Featured creator points to a missing creator record.',
          updatedAt: featured.updated_at,
          editorHref: '/studio/curation',
          quickFixLabel: 'Remove Featured Creator',
        }));
      }
    }
  }

  if (!narrativesResult.error) {
    for (const narrative of (narrativesResult.data ?? []) as NarrativeRow[]) {
      const slugs = narrative.cover_slugs ?? [];
      const missingSlugs = slugs.filter((slug) => !titleSlugs.has(slug));
      const issueDetails = [
        slugs.length < 4 ? 'Narrative has fewer than 4 titles.' : null,
        slugs.length > 6 ? 'Narrative has more than 6 titles.' : null,
        missingSlugs.length > 0 ? `Deleted title references: ${missingSlugs.join(', ')}` : null,
      ].filter(Boolean) as string[];

      if (issueDetails.length > 0) {
        pushIssue(genericIssue({
          id: narrative.id,
          entityType: 'narrative',
          title: narrative.title,
          subtitle: `${slugs.length} selected title${slugs.length === 1 ? '' : 's'}`,
          issueType: 'broken-featured',
          issueDetail: issueDetails.join(' '),
          updatedAt: narrative.updated_at,
          editorHref: '/studio/curation',
          quickFixLabel: 'Fix Narrative',
          metadata: { coverSlugs: slugs, validSlugs: slugs.filter((slug) => titleBySlug.has(slug)), missingSlugs },
        }));
      }
    }
  }

  const summaries = (Object.keys(ISSUE_META) as QAIssueType[]).map((type) => ({
    ...ISSUE_META[type],
    count: results.filter((item) => item.issueType === type).length,
  }));

  const activeCreators = creatorRows.filter((creator) => creator.status !== 'archived');
  return {
    summaries,
    results,
    creatorOptions: activeCreators.map((creator) => ({ id: creator.id, label: creator.name, subtitle: creator.slug })),
    featuredTitleOptions: titles.filter((title) => !title.hidden && !title.featured && title.cover_slug).map((title) => ({ id: title.id, label: title.title_english, subtitle: title.slug })),
    featuredCreatorOptions: activeCreators.map((creator) => ({ id: creator.id, label: creator.name, subtitle: creator.slug })),
  };
}

async function fetchTitleContext(titleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('titles').select('id, slug, title_english, synopsis, cover_slug, hidden, featured').eq('id', titleId).single();
  if (error || !data) throw new Error('Title not found.');
  return data as TitleRow;
}

export async function qaUpdateTitleCover(titleId: string): Promise<QAActionResult> {
  try {
    const supabase = await requireStudioAccess();
    const title = await fetchTitleContext(titleId);
    const { error } = await supabase.from('titles').update({ cover_slug: title.slug, updated_at: new Date().toISOString() }).eq('id', titleId);
    if (error) return { success: false, error: error.message };
    revalidateQA();
    await logQAAction('upload-cover', { entityId: titleId, entityType: 'title', title: title.title_english }, { newValues: { coverSlug: title.slug }, changedFields: ['coverSlug'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Cover update failed.' };
  }
}

export async function qaArchiveTitle(titleId: string): Promise<QAActionResult> {
  try {
    const supabase = await requireStudioAccess();
    const title = await fetchTitleContext(titleId);
    const { error } = await supabase.from('titles').update({ hidden: true, featured: false, updated_at: new Date().toISOString() }).eq('id', titleId);
    if (error) return { success: false, error: error.message };
    revalidateQA();
    await logQAAction('archive-title', { entityId: titleId, entityType: 'title', title: title.title_english }, { oldValues: { hidden: title.hidden, featured: title.featured }, newValues: { hidden: true, featured: false }, changedFields: ['hidden', 'featured'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Archive failed.' };
  }
}

export async function qaFillSynopsisWithAI(titleId: string): Promise<QAActionResult<{ synopsis: string }>> {
  try {
    const supabase = await requireStudioAccess();
    const title = await fetchTitleContext(titleId);
    const result = await generateTitleAutofill(title.title_english);
    const synopsis = result.payload.synopsis?.trim();
    if (!synopsis) return { success: false, error: 'AI did not return a synopsis for this title.' };

    const { error } = await supabase.from('titles').update({ synopsis, updated_at: new Date().toISOString() }).eq('id', titleId);
    if (error) return { success: false, error: error.message };
    revalidateQA();
    await logQAAction('fill-synopsis-ai', { entityId: titleId, entityType: 'title', title: title.title_english }, { oldValues: { synopsis: title.synopsis }, newValues: { synopsis }, changedFields: ['synopsis'] });
    return { success: true, data: { synopsis } };
  } catch (error) {
    if (error instanceof GeminiTitleGeneratorError) return { success: false, error: error.message };
    return { success: false, error: error instanceof Error ? error.message : 'AI synopsis failed.' };
  }
}

export async function qaAssignCreator(titleId: string, creatorId: string, role: 'author' | 'artist' | 'studio'): Promise<QAActionResult> {
  try {
    const supabase = await requireStudioAccess();
    const title = await fetchTitleContext(titleId);
    const { data: creator } = await supabase.from('creators').select('name').eq('id', creatorId).single();
    const { error } = await supabase.from('title_creators').upsert({ title_id: titleId, creator_id: creatorId, role }, { onConflict: 'title_id,creator_id,role' });
    if (error) return { success: false, error: error.message };
    revalidateQA();
    await logQAAction('assign-creator', { entityId: titleId, entityType: 'title', title: title.title_english }, { newValues: { creatorId, creatorName: creator?.name, role }, changedFields: ['creator'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Creator assignment failed.' };
  }
}

export async function qaAddReadingUrl(titleId: string, input: { platform: string; label: string; url: string }): Promise<QAActionResult> {
  try {
    const supabase = await requireStudioAccess();
    const title = await fetchTitleContext(titleId);
    const platform = input.platform.trim() || 'other';
    const label = input.label.trim() || 'Read online';
    const url = input.url.trim();
    if (!url) return { success: false, error: 'Reading URL is required.' };

    const { error } = await supabase.from('external_links').insert({ title_id: titleId, platform, label, url });
    if (error) return { success: false, error: error.message };
    revalidateQA();
    await logQAAction('add-reading-url', { entityId: titleId, entityType: 'title', title: title.title_english }, { newValues: { platform, label, url }, changedFields: ['readingUrl'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Reading URL save failed.' };
  }
}

export async function qaMarkReviewed(titleId: string): Promise<QAActionResult> {
  try {
    const supabase = await requireStudioAccess();
    const title = await fetchTitleContext(titleId);
    const body = 'Marked reviewed from QA.';
    const { error } = await supabase.from('reviews').upsert({ title_id: titleId, body, word_count: 4, last_edited: new Date().toISOString() }, { onConflict: 'title_id' });
    if (error) return { success: false, error: error.message };
    revalidateQA();
    await logQAAction('mark-reviewed', { entityId: titleId, entityType: 'title', title: title.title_english }, { changedFields: ['review'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Mark reviewed failed.' };
  }
}

export async function qaRemoveFeaturedTitle(titleId: string): Promise<QAActionResult> {
  try {
    const supabase = await requireStudioAccess();
    const title = await fetchTitleContext(titleId);
    const { error } = await supabase.from('titles').update({ featured: false, featured_order: null, updated_at: new Date().toISOString() }).eq('id', titleId);
    if (error) return { success: false, error: error.message };
    revalidateQA();
    await logQAAction('remove-featured-title', { entityId: titleId, entityType: 'featured-title', title: title.title_english }, { oldValues: { featured: title.featured }, newValues: { featured: false }, changedFields: ['featured'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Remove featured failed.' };
  }
}

export async function qaReplaceFeaturedTitle(oldTitleId: string, newTitleId: string): Promise<QAActionResult> {
  try {
    const supabase = await requireStudioAccess();
    const oldTitle = await fetchTitleContext(oldTitleId);
    const newTitle = await fetchTitleContext(newTitleId);
    const { error: oldError } = await supabase.from('titles').update({ featured: false, featured_order: null, updated_at: new Date().toISOString() }).eq('id', oldTitleId);
    if (oldError) return { success: false, error: oldError.message };
    const { error: newError } = await supabase.from('titles').update({ featured: true, updated_at: new Date().toISOString() }).eq('id', newTitleId);
    if (newError) return { success: false, error: newError.message };
    revalidateQA();
    await logQAAction('replace-featured-title', { entityId: oldTitleId, entityType: 'featured-title', title: oldTitle.title_english }, { oldValues: { titleId: oldTitleId, title: oldTitle.title_english }, newValues: { titleId: newTitleId, title: newTitle.title_english }, changedFields: ['featuredTitle'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Replace featured title failed.' };
  }
}

export async function qaRemoveFeaturedCreator(creatorId: string): Promise<QAActionResult> {
  try {
    const supabase = await requireStudioAccess();
    const { data: creator } = await supabase.from('creators').select('name').eq('id', creatorId).single();
    const { error } = await supabase.from('featured_creators').delete().eq('creator_id', creatorId);
    if (error) return { success: false, error: error.message };
    revalidateQA();
    await logQAAction('remove-featured-creator', { entityId: creatorId, entityType: 'featured-creator', title: creator?.name ?? 'Featured creator' }, { changedFields: ['featuredCreator'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Remove featured creator failed.' };
  }
}

export async function qaReplaceFeaturedCreator(oldCreatorId: string, newCreatorId: string): Promise<QAActionResult> {
  try {
    const supabase = await requireStudioAccess();
    const { error: deleteError } = await supabase.from('featured_creators').delete().eq('creator_id', oldCreatorId);
    if (deleteError) return { success: false, error: deleteError.message };
    const { error: insertError } = await supabase.from('featured_creators').upsert({ creator_id: newCreatorId, display_order: 0, featured_weight: 50, visible: true }, { onConflict: 'creator_id' });
    if (insertError) return { success: false, error: insertError.message };
    revalidateQA();
    await logQAAction('replace-featured-creator', { entityId: oldCreatorId, entityType: 'featured-creator', title: 'Featured creator' }, { oldValues: { creatorId: oldCreatorId }, newValues: { creatorId: newCreatorId }, changedFields: ['featuredCreator'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Replace featured creator failed.' };
  }
}

export async function qaArchiveCreator(creatorId: string): Promise<QAActionResult> {
  try {
    const supabase = await requireStudioAccess();
    const { data: creator } = await supabase.from('creators').select('name, status').eq('id', creatorId).single();
    const { error } = await supabase.from('creators').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', creatorId);
    if (error) return { success: false, error: error.message };
    revalidateQA();
    await logQAAction('archive-creator', { entityId: creatorId, entityType: 'creator', title: creator?.name ?? null }, { oldValues: { status: creator?.status ?? 'active' }, newValues: { status: 'archived' }, changedFields: ['status'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Archive creator failed.' };
  }
}

export async function qaAutoRemoveBrokenNarrativeReferences(narrativeId: string): Promise<QAActionResult> {
  try {
    const supabase = await requireStudioAccess();
    const { data: narrative, error: narrativeError } = await supabase.from('featured_narratives').select('title, cover_slugs').eq('id', narrativeId).single();
    if (narrativeError || !narrative) return { success: false, error: narrativeError?.message ?? 'Narrative not found.' };
    const slugs = (narrative.cover_slugs ?? []) as string[];
    const { data: titles } = await supabase.from('titles').select('slug').in('slug', slugs);
    const validSlugs = new Set((titles ?? []).map((title) => title.slug));
    const nextSlugs = slugs.filter((slug) => validSlugs.has(slug)).slice(0, 6);
    const { error } = await supabase.from('featured_narratives').update({ cover_slugs: nextSlugs }).eq('id', narrativeId);
    if (error) return { success: false, error: error.message };
    revalidateQA();
    await logQAAction('auto-remove-broken-references', { entityId: narrativeId, entityType: 'narrative', title: narrative.title }, { oldValues: { coverSlugs: slugs }, newValues: { coverSlugs: nextSlugs }, changedFields: ['coverSlugs'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Narrative cleanup failed.' };
  }
}

export async function qaIgnoreIssue(item: Pick<QAResultItem, 'id' | 'issueType' | 'entityType' | 'entityId' | 'title'>, reason?: string): Promise<QAActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Unauthorized' };
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('editorial_qa_ignores').upsert({ issue_key: item.id, issue_type: item.issueType, entity_type: item.entityType, entity_id: item.entityId, entity_name: item.title, reason: reason?.trim() || null, actor_id: user.id }, { onConflict: 'issue_key' });
    if (error) return { success: false, error: error.message };
    revalidateQA();
    await logQAAction('ignore', item, { reason: reason?.trim() || null, changedFields: ['ignored'] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Ignore failed.' };
  }
}

export async function qaBulkAction(action: QABulkAction, items: Array<Pick<QAResultItem, 'id' | 'issueType' | 'entityType' | 'entityId' | 'title'>>): Promise<QAActionResult<{ count: number }>> {
  try {
    let count = 0;
    for (const item of items) {
      const result = action === 'mark-reviewed' && item.issueType === 'unreviewed-titles'
        ? await qaMarkReviewed(item.entityId)
        : action === 'archive' && item.entityType === 'title'
          ? await qaArchiveTitle(item.entityId)
          : action === 'archive' && item.entityType === 'creator'
            ? await qaArchiveCreator(item.entityId)
            : action === 'ignore'
              ? await qaIgnoreIssue(item, 'Bulk ignored from QA.')
              : action === 'remove-featured' && item.entityType === 'featured-title'
                ? await qaRemoveFeaturedTitle(item.entityId)
                : action === 'remove-featured' && item.entityType === 'featured-creator'
                  ? await qaRemoveFeaturedCreator(item.entityId)
                  : { success: false };
      if (result.success) count += 1;
    }
    revalidateQA();
    return { success: true, data: { count } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Bulk action failed.' };
  }
}
