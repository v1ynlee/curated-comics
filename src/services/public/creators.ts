// ============================================================
// Creator Service — Supabase queries
// ============================================================

import { supabase } from '../api';
import { TITLE_SELECT, mapTitle, type TitleRow } from './titles';
import type { Creator, CreatorProfile, CreatorRole, CreatorTitle, CreatorType, CreatorWork } from '@/types/creator';
import type { Origin, TierLevel } from '@/types/title';

interface CreatorRow {
  id: string;
  slug: string;
  name: string;
  type: CreatorType;
  description: string | null;
  image: string | null;
  website: string | null;
  created_at: string;
}

interface CreatorLinkRow {
  creator_id: string;
  title_id: string;
  role: CreatorRole;
}

interface FeaturedCreatorRow {
  creator_id: string;
  display_order: number;
  featured_weight: number;
  visible: boolean;
}

interface CreatorWorkRow {
  creator_id: string;
  titles: {
    id: string;
    slug: string;
    title_english: string;
    cover_slug: string | null;
    origin: string | null;
    tier: string | null;
    dominant_color: string | null;
  } | null;
}

function uniqueRoles(links: CreatorLinkRow[], fallback: CreatorType): CreatorRole[] {
  const roles = [...new Set(links.map((link) => link.role))];
  return roles.length > 0 ? roles : [fallback];
}

function mapCreator(row: CreatorRow, links: CreatorLinkRow[] = []): Creator {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    website: row.website ?? undefined,
    roles: uniqueRoles(links, row.type),
    titleCount: new Set(links.map((link) => link.title_id)).size,
    createdAt: row.created_at,
  };
}

async function fetchCreatorLinks(creatorIds: string[]): Promise<CreatorLinkRow[]> {
  if (creatorIds.length === 0) return [];

  const { data, error } = await supabase
    .from('title_creators')
    .select('creator_id, title_id, role, titles!inner(hidden)')
    .in('creator_id', creatorIds)
    .eq('titles.hidden', false);

  if (error) return [];

  return (data as unknown as CreatorLinkRow[]) ?? [];
}

function groupLinksByCreator(links: CreatorLinkRow[]): Map<string, CreatorLinkRow[]> {
  const grouped = new Map<string, CreatorLinkRow[]>();

  for (const link of links) {
    const creatorLinks = grouped.get(link.creator_id) ?? [];
    creatorLinks.push(link);
    grouped.set(link.creator_id, creatorLinks);
  }

  return grouped;
}

async function fetchCreatorWorks(creatorIds: string[], limitPerCreator = 3): Promise<Map<string, CreatorWork[]>> {
  const worksByCreator = new Map<string, CreatorWork[]>();
  if (creatorIds.length === 0) return worksByCreator;

  const { data, error } = await supabase
    .from('title_creators')
    .select('creator_id, titles!inner(id, slug, title_english, cover_slug, origin, tier, dominant_color, hidden)')
    .in('creator_id', creatorIds)
    .eq('titles.hidden', false);

  if (error) return worksByCreator;

  for (const row of ((data as unknown as CreatorWorkRow[]) ?? [])) {
    const title = row.titles;
    if (!title) continue;

    const current = worksByCreator.get(row.creator_id) ?? [];
    if (current.length >= limitPerCreator || current.some((work) => work.id === title.id)) continue;

    current.push({
      id: title.id,
      slug: title.slug,
      title: title.title_english,
      coverSlug: title.cover_slug ?? title.slug,
      dominantColor: title.dominant_color ?? undefined,
      origin: (title.origin as Origin | null) ?? undefined,
      tier: (title.tier as TierLevel | null) ?? undefined,
    });
    worksByCreator.set(row.creator_id, current);
  }

  return worksByCreator;
}

async function attachCreatorWorks(creators: Creator[]): Promise<Creator[]> {
  const worksByCreator = await fetchCreatorWorks(creators.map((creator) => creator.id));
  return creators.map((creator) => ({
    ...creator,
    works: worksByCreator.get(creator.id) ?? [],
  }));
}

function fillCreatorSelection(selected: Creator[], creators: Creator[], limit: number): Creator[] {
  if (selected.length >= limit) return selected.slice(0, limit);

  const selectedIds = new Set(selected.map((creator) => creator.id));
  const extras = creators
    .filter((creator) => !selectedIds.has(creator.id))
    .sort((a, b) => b.titleCount - a.titleCount || a.name.localeCompare(b.name));

  return [...selected, ...extras].slice(0, limit);
}

export async function fetchCreators(): Promise<Creator[]> {
  const { data, error } = await supabase
    .from('creators')
    .select('id, slug, name, type, description, image, website, created_at')
    .order('name', { ascending: true });

  if (error) return [];

  const rows = (data as CreatorRow[]) ?? [];
  const linksByCreator = groupLinksByCreator(
    await fetchCreatorLinks(rows.map((row) => row.id)),
  );

  return rows.map((row) => mapCreator(row, linksByCreator.get(row.id)));
}

export async function fetchFeaturedCreators(limit = 4): Promise<Creator[]> {
  const [{ data: settingData }, creators] = await Promise.all([
    supabase
      .from('curation_settings')
      .select('value')
      .eq('key', 'featured_creators_random')
      .single(),
    fetchCreators(),
  ]);

  const { data, error } = await supabase
    .from('featured_creators')
    .select('creator_id, display_order, featured_weight, visible')
    .eq('visible', true)
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return attachCreatorWorks(creators
      .slice()
      .sort((a, b) => b.titleCount - a.titleCount || a.name.localeCompare(b.name))
      .slice(0, limit));
  }

  const featuredRows = data as FeaturedCreatorRow[];
  const creatorsById = new Map(creators.map((creator) => [creator.id, creator]));
  const featuredCreators = featuredRows
    .map((row) => ({ row, creator: creatorsById.get(row.creator_id) }))
    .filter((entry): entry is { row: FeaturedCreatorRow; creator: Creator } => Boolean(entry.creator));

  const randomEnabled = Boolean((settingData?.value as { enabled?: boolean } | null)?.enabled);
  if (!randomEnabled) {
    return attachCreatorWorks(fillCreatorSelection(featuredCreators.map((entry) => entry.creator), creators, limit));
  }

  const pool = [...featuredCreators];
  const selected: Creator[] = [];
  while (pool.length > 0 && selected.length < limit) {
    const total = pool.reduce((sum, entry) => sum + entry.row.featured_weight, 0);
    let cursor = Math.random() * total;
    const index = pool.findIndex((entry) => {
      cursor -= entry.row.featured_weight;
      return cursor <= 0;
    });
    const [entry] = pool.splice(index < 0 ? 0 : index, 1);
    selected.push(entry.creator);
  }

  return attachCreatorWorks(fillCreatorSelection(selected, creators, limit));
}

export async function fetchCreator(slug: string): Promise<Creator | null> {
  const { data, error } = await supabase
    .from('creators')
    .select('id, slug, name, type, description, image, website, created_at')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    return null;
  }

  const row = data as CreatorRow;
  const links = await fetchCreatorLinks([row.id]);
  return mapCreator(row, links);
}

export async function fetchTitlesByCreator(creatorId: string): Promise<CreatorTitle[]> {
  const { data: linksData, error: linksError } = await supabase
    .from('title_creators')
    .select('title_id, role')
    .eq('creator_id', creatorId);

  if (linksError) throw new Error(`fetchTitlesByCreator links: ${linksError.message}`);

  const links = (linksData as Pick<CreatorLinkRow, 'title_id' | 'role'>[]) ?? [];
  const titleIds = [...new Set(links.map((link) => link.title_id))];
  if (titleIds.length === 0) return [];

  const rolesByTitle = new Map<string, CreatorRole[]>();
  for (const link of links) {
    const roles = rolesByTitle.get(link.title_id) ?? [];
    roles.push(link.role);
    rolesByTitle.set(link.title_id, [...new Set(roles)]);
  }

  const { data: titleData, error: titleError } = await supabase
    .from('titles')
    .select(TITLE_SELECT)
    .in('id', titleIds)
    .eq('hidden', false)
    .order('last_read_date', { ascending: false });

  if (titleError) throw new Error(`fetchTitlesByCreator titles: ${titleError.message}`);

  return ((titleData as unknown as TitleRow[]) ?? []).map((row) => ({
    title: mapTitle(row),
    roles: rolesByTitle.get(row.id) ?? [],
  }));
}

export async function fetchCreatorProfile(slug: string): Promise<CreatorProfile | null> {
  const creator = await fetchCreator(slug);
  if (!creator) return null;

  const titles = await fetchTitlesByCreator(creator.id);
  const roles = [...new Set(titles.flatMap((entry) => entry.roles))];

  return {
    creator: {
      ...creator,
      roles: roles.length > 0 ? roles : creator.roles,
      titleCount: titles.length,
    },
    titles,
  };
}
