'use server';

// ============================================================
// Curation Server Actions — Persist featured title selections,
// curated collections, and mood/theme curations.
// Requirements: 8.7, 18.1, 18.2, 18.3, 18.4, 18.5
// ============================================================

import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { revalidatePath } from 'next/cache';
import { toSlug } from '@/lib/utils/utils';
import { logStudioActivity } from '@/services/studio/activity-log';
import { fetchMoodThemesData, fetchTiersData } from './data';

// ── Types ───────────────────────────────────────────────────────

interface FeaturedUpdate {
  id: string;
  featured: boolean;
  featured_order: number;
}

export type CollectionCategory = 'by-artist' | 'by-author' | 'recommended' | 'featured';

export interface CuratedCollectionRow {
  id: string;
  name: string;
  slug: string;
  category: CollectionCategory;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoodCurationRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionTitleRow {
  collection_id: string;
  title_id: string;
  position: number;
  added_at: string;
}

export interface MoodCurationTitleRow {
  curation_id: string;
  title_id: string;
  position: number;
  added_at: string;
}

// ── Featured Curation (existing) ────────────────────────────────

export async function saveCuration(updates: FeaturedUpdate[]) {
  const user = await getServerUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createSupabaseServerClient();

  const results = await Promise.all(
    updates.map(({ id, featured, featured_order }) =>
      supabase
        .from('titles')
        .update({ featured, featured_order, updated_at: new Date().toISOString() })
        .eq('id', id),
    ),
  );

  const failed = results.filter((r) => r.error);
  if (failed.length > 0) {
    console.error('Curation save errors:', failed.map((f) => f.error));
    return { success: false, error: `Failed to update ${failed.length} title(s)` };
  }

  revalidatePath('/');
  revalidatePath('/studio/curation');

  return { success: true };
}

// ── Curated Collections ─────────────────────────────────────────

export async function createCollection(data: {
  name: string;
  category: CollectionCategory;
  description?: string;
}) {
  const user = await getServerUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();
  const slug = toSlug(data.name);

  const { data: row, error } = await supabase
    .from('curated_collections')
    .insert({
      name: data.name,
      slug,
      category: data.category,
      description: data.description || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create collection:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/studio/curation');
  return { success: true, data: row };
}

export async function deleteCollection(collectionId: string) {
  const user = await getServerUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('curated_collections')
    .delete()
    .eq('id', collectionId);

  if (error) {
    console.error('Failed to delete collection:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/studio/curation');
  return { success: true };
}

export async function addTitleToCollection(collectionId: string, titleId: string) {
  const user = await getServerUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();

  // Get the next position
  const { data: existing } = await supabase
    .from('collection_titles')
    .select('position')
    .eq('collection_id', collectionId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { error } = await supabase
    .from('collection_titles')
    .insert({
      collection_id: collectionId,
      title_id: titleId,
      position: nextPosition,
    });

  if (error) {
    console.error('Failed to add title to collection:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/studio/curation');
  return { success: true };
}

export async function removeTitleFromCollection(collectionId: string, titleId: string) {
  const user = await getServerUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('collection_titles')
    .delete()
    .eq('collection_id', collectionId)
    .eq('title_id', titleId);

  if (error) {
    console.error('Failed to remove title from collection:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/studio/curation');
  return { success: true };
}

// ── Mood/Theme Curations ────────────────────────────────────────

export async function createMoodCuration(data: {
  name: string;
  description?: string;
}) {
  const user = await getServerUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();
  const slug = toSlug(data.name);

  const { data: row, error } = await supabase
    .from('mood_curations')
    .insert({
      name: data.name,
      slug,
      description: data.description || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create mood curation:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/studio/curation');
  return { success: true, data: row };
}

export async function deleteMoodCuration(curationId: string) {
  const user = await getServerUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('mood_curations')
    .delete()
    .eq('id', curationId);

  if (error) {
    console.error('Failed to delete mood curation:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/studio/curation');
  return { success: true };
}

export async function addTitleToMoodCuration(curationId: string, titleId: string) {
  const user = await getServerUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();

  // Get the next position
  const { data: existing } = await supabase
    .from('mood_curation_titles')
    .select('position')
    .eq('curation_id', curationId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { error } = await supabase
    .from('mood_curation_titles')
    .insert({
      curation_id: curationId,
      title_id: titleId,
      position: nextPosition,
    });

  if (error) {
    console.error('Failed to add title to mood curation:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/studio/curation');
  return { success: true };
}

export async function removeTitleFromMoodCuration(curationId: string, titleId: string) {
  const user = await getServerUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('mood_curation_titles')
    .delete()
    .eq('curation_id', curationId)
    .eq('title_id', titleId);

  if (error) {
    console.error('Failed to remove title from mood curation:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/studio/curation');
  return { success: true };
}

// ── Editorial Curation System ───────────────────────────────────

export type CurationSettingKey =
  | 'featured_narratives_random'
  | 'featured_titles_random'
  | 'featured_creators_random';

export interface FeaturedNarrativeUpdate {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  cover_slugs?: string[];
  display_order?: number;
  featured_weight?: number;
  visible?: boolean;
}

export interface FeaturedNarrativeInput {
  title: string;
  description: string;
  cover_slugs: string[];
}

export interface FeaturedTitleUpdate {
  id: string;
  featured: boolean;
  featured_order: number;
  featured_weight: number;
}

export interface FeaturedCreatorUpdate {
  creator_id: string;
  display_order: number;
  featured_weight: number;
  visible: boolean;
}

export interface ThemeUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  cover_image?: string | null;
  theme_color?: string | null;
  visible?: boolean;
  sort_order?: number;
}

export interface TierDefinitionUpdate {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  color?: string;
  icon?: string | null;
  display_order?: number;
  visible?: boolean;
}

async function requireStudioUser() {
  const user = await getServerUser();
  if (!user) return null;
  return createSupabaseServerClient();
}

export async function loadMoodThemesCurationData() {
  const user = await getServerUser();
  if (!user) throw new Error('Unauthorized');
  return fetchMoodThemesData();
}

export async function loadTiersCurationData() {
  const user = await getServerUser();
  if (!user) throw new Error('Unauthorized');
  return fetchTiersData();
}

function clampWeight(value: number) {
  return Math.min(100, Math.max(1, Math.round(value)));
}

function revalidateCurationSurfaces() {
  revalidatePath('/');
  revalidatePath('/discover');
  revalidatePath('/tiers');
  revalidatePath('/studio/curation');
}

export async function updateCurationSetting(key: CurationSettingKey, enabled: boolean) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('curation_settings')
    .upsert({ key, value: { enabled } }, { onConflict: 'key' });

  if (error) return { success: false, error: error.message };

  revalidateCurationSurfaces();
  return { success: true };
}

export async function createFeaturedNarrative(input: FeaturedNarrativeInput) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const title = input.title.trim();
  const description = input.description.trim();
  if (!title) return { success: false, error: 'Narrative title is required.' };
  if (title.length > 120) return { success: false, error: 'Narrative title must be 120 characters or less.' };
  if (!description) return { success: false, error: 'Narrative description is required.' };
  if (input.cover_slugs.length < 4 || input.cover_slugs.length > 6) {
    return { success: false, error: 'Select between 4 and 6 narrative titles.' };
  }

  const { data: existing } = await supabase
    .from('featured_narratives')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1);

  const displayOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

  const { data, error } = await supabase
    .from('featured_narratives')
    .insert({
      title,
      subtitle: null,
      description,
      cta_text: 'Explore',
      cta_href: '/discover',
      cover_slugs: input.cover_slugs,
      display_order: displayOrder,
      featured_weight: 50,
      visible: true,
    })
    .select('*')
    .single();

  if (error) return { success: false, error: error.message };

  revalidateCurationSurfaces();

  await logStudioActivity({
    eventType: 'NARRATIVE_CREATED',
    entityType: 'narrative',
    entityId: data.id,
    entityName: data.title,
    metadata: {
      newValues: {
        title,
        description,
        coverSlugs: input.cover_slugs,
        displayOrder,
      },
      changedFields: ['title', 'description', 'coverSlugs', 'displayOrder'],
    },
  });

  return { success: true, data };
}

export async function updateFeaturedNarrative(id: string, update: FeaturedNarrativeUpdate) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };
  if (!id) return { success: false, error: 'Narrative id is required.' };

  const { data: existing } = await supabase
    .from('featured_narratives')
    .select('title, description, cover_slugs, display_order, featured_weight, visible')
    .eq('id', id)
    .single();

  if (update.title !== undefined) {
    const title = update.title.trim();
    if (!title) return { success: false, error: 'Narrative title is required.' };
    if (title.length > 120) return { success: false, error: 'Narrative title must be 120 characters or less.' };
    update.title = title;
  }

  if (update.description !== undefined) {
    const description = update.description?.trim() ?? '';
    if (!description) return { success: false, error: 'Narrative description is required.' };
    update.description = description;
  }

  if (update.cover_slugs !== undefined && (update.cover_slugs.length < 4 || update.cover_slugs.length > 6)) {
    return { success: false, error: 'Select between 4 and 6 narrative titles.' };
  }

  const payload = {
    ...update,
    featured_weight: update.featured_weight === undefined ? undefined : clampWeight(update.featured_weight),
  };

  const { error } = await supabase
    .from('featured_narratives')
    .update(payload)
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidateCurationSurfaces();

  await logStudioActivity({
    eventType: 'NARRATIVE_UPDATED',
    entityType: 'narrative',
    entityId: id,
    entityName: update.title ?? existing?.title ?? null,
    metadata: {
      oldValues: existing ? {
        title: existing.title,
        description: existing.description,
        coverSlugs: existing.cover_slugs,
        displayOrder: existing.display_order,
        featuredWeight: existing.featured_weight,
        visible: existing.visible,
      } : undefined,
      newValues: payload,
      changedFields: Object.keys(payload).filter((key) => payload[key as keyof typeof payload] !== undefined),
    },
  });

  return { success: true };
}

export async function duplicateFeaturedNarrative(id: string) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { data: narrative, error: fetchError } = await supabase
    .from('featured_narratives')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) return { success: false, error: fetchError.message };

  const { data: existing } = await supabase
    .from('featured_narratives')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1);

  const displayOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;
  const { id: _id, created_at: _created, updated_at: _updated, ...copy } = narrative;

  const { data, error } = await supabase
    .from('featured_narratives')
    .insert({
      ...copy,
      title: `${narrative.title} copy`,
      display_order: displayOrder,
      visible: false,
    })
    .select('*')
    .single();

  void _id;
  void _created;
  void _updated;

  if (error) return { success: false, error: error.message };

  revalidateCurationSurfaces();
  return { success: true, data };
}

export async function deleteFeaturedNarrative(id: string) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { data: existing } = await supabase
    .from('featured_narratives')
    .select('title, description, cover_slugs')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('featured_narratives')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidateCurationSurfaces();

  await logStudioActivity({
    eventType: 'NARRATIVE_DELETED',
    entityType: 'narrative',
    entityId: id,
    entityName: existing?.title ?? null,
    metadata: {
      oldValues: existing ? {
        title: existing.title,
        description: existing.description,
        coverSlugs: existing.cover_slugs,
      } : undefined,
      changedFields: ['deleted'],
    },
  });

  return { success: true };
}

export async function saveFeaturedNarrativeOrder(updates: { id: string; display_order: number }[]) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const results = await Promise.all(
    updates.map((item) =>
      supabase
        .from('featured_narratives')
        .update({ display_order: item.display_order })
        .eq('id', item.id),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) return { success: false, error: failed.error.message };

  revalidateCurationSurfaces();
  return { success: true };
}

export async function saveFeaturedTitles(updates: FeaturedTitleUpdate[]) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const validUpdates = updates.filter((item) => item.id);
  if (validUpdates.length !== updates.length) return { success: false, error: 'Featured title id is required.' };
  if (validUpdates.length === 0) return { success: true };

  const { data: existingTitles } = await supabase
    .from('titles')
    .select('id, title_english, featured, featured_order, featured_weight')
    .in('id', validUpdates.map((item) => item.id));
  const existingById = new Map((existingTitles ?? []).map((item) => [item.id, item]));

  const results = await Promise.all(
    validUpdates.map((item) =>
      supabase
        .from('titles')
        .update({
          featured: item.featured,
          featured_order: item.featured_order,
          featured_weight: clampWeight(item.featured_weight),
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) return { success: false, error: failed.error.message };

  revalidateCurationSurfaces();

  await Promise.all(
    validUpdates.map(async (item) => {
      const existing = existingById.get(item.id);
      if (!existing || existing.featured === item.featured) return;

      await logStudioActivity({
        eventType: item.featured ? 'FEATURED_TITLE_ADDED' : 'FEATURED_TITLE_REMOVED',
        entityType: 'featured',
        entityId: item.id,
        entityName: existing.title_english,
        metadata: {
          oldValues: {
            featured: existing.featured,
            featuredOrder: existing.featured_order,
            featuredWeight: existing.featured_weight,
          },
          newValues: {
            featured: item.featured,
            featuredOrder: item.featured_order,
            featuredWeight: clampWeight(item.featured_weight),
          },
          changedFields: ['featured', 'featuredOrder', 'featuredWeight'],
        },
      });
    }),
  );

  return { success: true };
}

export async function addFeaturedCreator(creatorId: string) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { data: creator } = await supabase
    .from('creators')
    .select('name')
    .eq('id', creatorId)
    .single();

  const { data: existing } = await supabase
    .from('featured_creators')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1);

  const displayOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

  const { error } = await supabase
    .from('featured_creators')
    .upsert({
      creator_id: creatorId,
      display_order: displayOrder,
      featured_weight: 50,
      visible: true,
    }, { onConflict: 'creator_id' });

  if (error) return { success: false, error: error.message };

  revalidateCurationSurfaces();

  await logStudioActivity({
    eventType: 'FEATURED_CREATOR_ADDED',
    entityType: 'featured',
    entityId: creatorId,
    entityName: creator?.name ?? null,
    metadata: {
      newValues: {
        creatorId,
        displayOrder,
        featuredWeight: 50,
        visible: true,
      },
      changedFields: ['creatorId', 'displayOrder', 'featuredWeight', 'visible'],
    },
  });

  return { success: true };
}

export async function saveFeaturedCreators(updates: FeaturedCreatorUpdate[]) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('featured_creators')
    .upsert(
      updates.map((item) => ({
        creator_id: item.creator_id,
        display_order: item.display_order,
        featured_weight: clampWeight(item.featured_weight),
        visible: item.visible,
      })),
      { onConflict: 'creator_id' },
    );

  if (error) return { success: false, error: error.message };

  revalidateCurationSurfaces();
  return { success: true };
}

export async function removeFeaturedCreator(creatorId: string) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { data: creator } = await supabase
    .from('creators')
    .select('name')
    .eq('id', creatorId)
    .single();

  const { error } = await supabase
    .from('featured_creators')
    .delete()
    .eq('creator_id', creatorId);

  if (error) return { success: false, error: error.message };

  revalidateCurationSurfaces();

  await logStudioActivity({
    eventType: 'FEATURED_CREATOR_REMOVED',
    entityType: 'featured',
    entityId: creatorId,
    entityName: creator?.name ?? null,
    metadata: {
      oldValues: { creatorId, visible: true },
      changedFields: ['creatorId', 'visible'],
    },
  });

  return { success: true };
}

export async function updateTheme(themeId: string, update: ThemeUpdate) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('moods')
    .update(update)
    .eq('id', themeId);

  if (error) return { success: false, error: error.message };

  revalidateCurationSurfaces();
  return { success: true };
}

export async function deleteTheme(themeId: string) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('moods')
    .delete()
    .eq('id', themeId);

  if (error) return { success: false, error: error.message };
  revalidateCurationSurfaces();
  return { success: true };
}

export async function assignTitlesToTheme(themeId: string, titleIds: string[]) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { data: existing } = await supabase
    .from('title_moods')
    .select('position')
    .eq('mood_id', themeId)
    .order('position', { ascending: false })
    .limit(1);

  const startPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { error } = await supabase
    .from('title_moods')
    .upsert(
      titleIds.map((titleId, index) => ({
        mood_id: themeId,
        title_id: titleId,
        position: startPosition + index,
      })),
      { onConflict: 'title_id,mood_id' },
    );

  if (error) return { success: false, error: error.message };
  revalidateCurationSurfaces();
  return { success: true };
}

export async function removeTitleFromTheme(themeId: string, titleId: string) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('title_moods')
    .delete()
    .eq('mood_id', themeId)
    .eq('title_id', titleId);

  if (error) return { success: false, error: error.message };
  revalidateCurationSurfaces();
  return { success: true };
}

export async function reorderThemeTitles(themeId: string, titleIds: string[]) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const results = await Promise.all(
    titleIds.map((titleId, position) =>
      supabase
        .from('title_moods')
        .update({ position })
        .eq('mood_id', themeId)
        .eq('title_id', titleId),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) return { success: false, error: failed.error.message };
  revalidateCurationSurfaces();
  return { success: true };
}

export async function updateTierDefinitions(updates: TierDefinitionUpdate[]) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const results = await Promise.all(
    updates.map((item) => {
      const { id, ...payload } = item;
      return supabase.from('tier_definitions').update(payload).eq('id', id);
    }),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) return { success: false, error: failed.error.message };
  revalidateCurationSurfaces();
  return { success: true };
}

export async function assignTitleToTier(tierId: string, titleId: string) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { data: tier, error: tierError } = await supabase
    .from('tier_definitions')
    .select('name')
    .eq('id', tierId)
    .single();

  if (tierError) return { success: false, error: tierError.message };

  const { data: existing } = await supabase
    .from('tier_titles')
    .select('position')
    .eq('tier_id', tierId)
    .order('position', { ascending: false })
    .limit(1);

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { error: deleteError } = await supabase
    .from('tier_titles')
    .delete()
    .eq('title_id', titleId);

  if (deleteError) return { success: false, error: deleteError.message };

  const { error: insertError } = await supabase
    .from('tier_titles')
    .insert({ tier_id: tierId, title_id: titleId, position });

  if (insertError) return { success: false, error: insertError.message };

  const { error: titleError } = await supabase
    .from('titles')
    .update({ tier: tier.name })
    .eq('id', titleId);

  if (titleError) return { success: false, error: titleError.message };

  revalidateCurationSurfaces();
  return { success: true };
}

export async function removeTitleFromTier(tierId: string, titleId: string) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const { error: relationError } = await supabase
    .from('tier_titles')
    .delete()
    .eq('tier_id', tierId)
    .eq('title_id', titleId);

  if (relationError) return { success: false, error: relationError.message };

  const { error: titleError } = await supabase
    .from('titles')
    .update({ tier: null })
    .eq('id', titleId);

  if (titleError) return { success: false, error: titleError.message };
  revalidateCurationSurfaces();
  return { success: true };
}

export async function reorderTierTitles(tierId: string, titleIds: string[]) {
  const supabase = await requireStudioUser();
  if (!supabase) return { success: false, error: 'Unauthorized' };

  const results = await Promise.all(
    titleIds.map((titleId, position) =>
      supabase
        .from('tier_titles')
        .update({ position })
        .eq('tier_id', tierId)
        .eq('title_id', titleId),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) return { success: false, error: failed.error.message };
  revalidateCurationSurfaces();
  return { success: true };
}
