'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { toSlug } from '@/lib/utils/utils';
import { logStudioActivity } from '@/services/studio/activity-log';
import type { CreatorFormInput, CreatorTitleOption, StudioCreator, StudioCreatorStatus, StudioCreatorType } from './types';

interface CreatorRow {
  id: string;
  slug: string;
  name: string;
  type: StudioCreatorType;
  description: string | null;
  image: string | null;
  website: string | null;
  status?: StudioCreatorStatus | null;
  created_at: string;
  updated_at: string | null;
}

interface TitleCreatorRow {
  creator_id: string;
  title_id: string;
}

const CREATOR_SELECT_WITH_STATUS = 'id, slug, name, type, description, image, website, status, created_at, updated_at';
const CREATOR_SELECT_FALLBACK = 'id, slug, name, type, description, image, website, created_at, updated_at';

async function requireStudioUser() {
  const user = await getServerUser();
  if (!user) throw new Error('Unauthorized');
  return createSupabaseServerClient();
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

function validateInput(input: CreatorFormInput) {
  const name = input.name.trim();
  if (!name) return 'Creator name is required.';
  if (name.length > 120) return 'Creator name must be 120 characters or less.';
  if (!['author', 'artist', 'studio'].includes(input.type)) return 'Invalid creator type.';
  return null;
}

async function buildUniqueSlug(name: string, currentId?: string) {
  const supabase = await createSupabaseServerClient();
  const base = toSlug(name) || 'creator';
  let slug = base;
  let suffix = 2;

  for (;;) {
    let query = supabase.from('creators').select('id').eq('slug', slug).limit(1);
    if (currentId) query = query.neq('id', currentId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

function revalidateCreatorSurfaces() {
  revalidatePath('/studio/creators');
  revalidatePath('/studio/curation');
  revalidatePath('/creators');
  revalidatePath('/');
}

function mapCreators(rows: CreatorRow[], links: TitleCreatorRow[]): StudioCreator[] {
  const titleIds = new Map<string, Set<string>>();
  for (const link of links) {
    const set = titleIds.get(link.creator_id) ?? new Set<string>();
    set.add(link.title_id);
    titleIds.set(link.creator_id, set);
  }

  return rows.map((row) => {
    const related = Array.from(titleIds.get(row.id) ?? []);
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      type: row.type,
      description: row.description,
      image: row.image,
      website: row.website,
      status: row.status ?? 'active',
      title_count: related.length,
      related_title_ids: related,
      created_at: row.created_at,
      updated_at: row.updated_at ?? row.created_at,
    };
  });
}

async function fetchCreatorRows(): Promise<CreatorRow[]> {
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from('creators')
    .select(CREATOR_SELECT_WITH_STATUS)
    .order('updated_at', { ascending: false });

  if (!result.error) return (result.data ?? []) as CreatorRow[];

  const fallback = await supabase
    .from('creators')
    .select(CREATOR_SELECT_FALLBACK)
    .order('updated_at', { ascending: false });

  if (fallback.error) throw new Error(fallback.error.message);
  return (fallback.data ?? []) as CreatorRow[];
}

export async function fetchStudioCreators(): Promise<StudioCreator[]> {
  await requireStudioUser();
  const supabase = await createSupabaseServerClient();
  const [creators, linksResult] = await Promise.all([
    fetchCreatorRows(),
    supabase.from('title_creators').select('creator_id, title_id'),
  ]);

  if (linksResult.error) throw new Error(linksResult.error.message);
  return mapCreators(creators, (linksResult.data ?? []) as TitleCreatorRow[]);
}

export async function fetchCreatorTitleOptions(): Promise<CreatorTitleOption[]> {
  await requireStudioUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('titles')
    .select('id, title_english, slug')
    .eq('hidden', false)
    .order('title_english', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CreatorTitleOption[];
}

async function replaceCreatorTitles(creatorId: string, type: StudioCreatorType, titleIds: string[]) {
  const supabase = await createSupabaseServerClient();
  const { error: deleteError } = await supabase
    .from('title_creators')
    .delete()
    .eq('creator_id', creatorId);

  if (deleteError) throw new Error(deleteError.message);
  if (titleIds.length === 0) return;

  const role = type === 'studio' ? 'studio' : type;
  const { error: insertError } = await supabase
    .from('title_creators')
    .insert(titleIds.map((titleId) => ({ creator_id: creatorId, title_id: titleId, role })));

  if (insertError) throw new Error(insertError.message);
}

export async function createStudioCreator(input: CreatorFormInput) {
  try {
    const supabase = await requireStudioUser();
    const validationError = validateInput(input);
    if (validationError) return { success: false, error: validationError };

    const name = input.name.trim();
    const slug = await buildUniqueSlug(name);
    const { data, error } = await supabase
      .from('creators')
      .insert({
        name,
        slug,
        type: input.type,
        description: normalizeText(input.description),
        image: normalizeText(input.image),
        website: normalizeText(input.website),
        status: 'active',
      })
      .select(CREATOR_SELECT_WITH_STATUS)
      .single();

    if (error) return { success: false, error: error.message };
    await replaceCreatorTitles(data.id, input.type, input.related_title_ids);
    revalidateCreatorSurfaces();

    await logStudioActivity({
      eventType: 'CREATOR_CREATED',
      entityType: 'creator',
      entityId: data.id,
      entityName: name,
      metadata: {
        newValues: {
          name,
          slug,
          type: input.type,
          website: normalizeText(input.website),
          relatedTitleCount: input.related_title_ids.length,
        },
        changedFields: ['name', 'slug', 'type', 'website', 'relatedTitleCount'],
      },
    });

    const [creator] = mapCreators([data as CreatorRow], input.related_title_ids.map((titleId) => ({ creator_id: data.id, title_id: titleId })));
    return { success: true, data: creator };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Creator creation failed.' };
  }
}

export async function updateStudioCreator(id: string, input: CreatorFormInput) {
  try {
    if (!id) return { success: false, error: 'Creator id is required.' };
    const supabase = await requireStudioUser();
    const validationError = validateInput(input);
    if (validationError) return { success: false, error: validationError };

    const { data: existing } = await supabase
      .from('creators')
      .select('name, slug, type, description, image, website, status')
      .eq('id', id)
      .single();

    const name = input.name.trim();
    const slug = await buildUniqueSlug(name, id);
    const { data, error } = await supabase
      .from('creators')
      .update({
        name,
        slug,
        type: input.type,
        description: normalizeText(input.description),
        image: normalizeText(input.image),
        website: normalizeText(input.website),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(CREATOR_SELECT_WITH_STATUS)
      .single();

    if (error) return { success: false, error: error.message };
    await replaceCreatorTitles(id, input.type, input.related_title_ids);
    revalidateCreatorSurfaces();

    await logStudioActivity({
      eventType: 'CREATOR_UPDATED',
      entityType: 'creator',
      entityId: id,
      entityName: name,
      metadata: {
        oldValues: existing ? {
          name: existing.name,
          slug: existing.slug,
          type: existing.type,
          description: existing.description,
          image: existing.image,
          website: existing.website,
          status: existing.status ?? 'active',
        } : undefined,
        newValues: {
          name,
          slug,
          type: input.type,
          description: normalizeText(input.description),
          image: normalizeText(input.image),
          website: normalizeText(input.website),
          relatedTitleCount: input.related_title_ids.length,
        },
        changedFields: ['name', 'slug', 'type', 'description', 'image', 'website', 'relatedTitleCount'],
      },
    });

    const [creator] = mapCreators([data as CreatorRow], input.related_title_ids.map((titleId) => ({ creator_id: id, title_id: titleId })));
    return { success: true, data: creator };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Creator update failed.' };
  }
}

export async function setStudioCreatorStatus(id: string, status: StudioCreatorStatus) {
  try {
    if (!id) return { success: false, error: 'Creator id is required.' };
    const supabase = await requireStudioUser();
    const { data: existing } = await supabase
      .from('creators')
      .select('name, status')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('creators')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidateCreatorSurfaces();

    await logStudioActivity({
      eventType: status === 'archived' ? 'CREATOR_ARCHIVED' : 'CREATOR_UPDATED',
      entityType: 'creator',
      entityId: id,
      entityName: existing?.name ?? null,
      metadata: {
        oldValues: { status: existing?.status ?? 'active' },
        newValues: { status },
        changedFields: ['status'],
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Creator status update failed.' };
  }
}

export async function deleteStudioCreator(id: string) {
  try {
    if (!id) return { success: false, error: 'Creator id is required.' };
    const supabase = await requireStudioUser();
    const { error: linkError } = await supabase.from('title_creators').delete().eq('creator_id', id);
    if (linkError) return { success: false, error: linkError.message };

    const { error } = await supabase.from('creators').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidateCreatorSurfaces();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Creator delete failed.' };
  }
}
