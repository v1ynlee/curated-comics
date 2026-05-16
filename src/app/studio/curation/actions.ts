'use server';

// ============================================================
// Curation Server Actions — Persist featured title selections,
// curated collections, and mood/theme curations.
// Requirements: 8.7, 18.1, 18.2, 18.3, 18.4, 18.5
// ============================================================

import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { revalidatePath } from 'next/cache';
import { toSlug } from '@/lib/utils/utils';

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
