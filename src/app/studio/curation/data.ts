// ============================================================
// Studio Curation Data Loaders
// Server-only fetch helpers with schema-tolerant fallbacks.
// ============================================================

import { createSupabaseServerClient } from '@/lib/db/supabase-server';
import { TIER_CONFIG, type TierLevel } from '@/types/title';
import type {
  CurationCreator,
  CurationSettingsState,
  CurationTitle,
  FeaturedCurationData,
  FeaturedNarrative,
  MoodTheme,
  MoodThemesData,
  TierDefinition,
  TiersData,
} from './types';

interface TitleRow {
  id: string;
  slug: string;
  title_english: string;
  origin: 'manhwa' | 'manga' | 'manhua';
  tier: string | null;
  cover_slug: string | null;
  dominant_color: string | null;
  featured: boolean;
  featured_order: number | null;
  created_at: string;
  updated_at: string;
  ratings: { overall: number } | null;
}

interface TitleWeightRow {
  id: string;
  featured_weight: number | null;
}

interface CreatorRow {
  id: string;
  slug: string;
  name: string;
  type: 'author' | 'artist' | 'studio';
  image: string | null;
  website: string | null;
  created_at: string;
  updated_at?: string | null;
}

interface FeaturedCreatorRow {
  creator_id: string;
  display_order: number;
  featured_weight: number;
  visible: boolean;
  updated_at: string;
}

interface TitleCreatorRow {
  creator_id: string;
  title_id: string;
}

interface MoodBaseRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  atmosphere: { accentColor?: string } | null;
  sort_order: number | null;
  created_at: string;
}

interface MoodConfigRow {
  id: string;
  cover_image: string | null;
  theme_color: string | null;
  visible: boolean | null;
  updated_at: string | null;
}

interface TitleMoodRow {
  mood_id: string;
  title_id: string;
  position?: number | null;
}

interface TierDefinitionRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  display_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

interface TierTitleRow {
  tier_id: string;
  title_id: string;
  position: number;
}

const DEFAULT_SETTINGS: CurationSettingsState = {
  featuredNarrativesRandom: false,
  featuredTitlesRandom: false,
  featuredCreatorsRandom: false,
};

const BASE_TITLE_SELECT = 'id, slug, title_english, origin, tier, cover_slug, dominant_color, featured, featured_order, created_at, updated_at, ratings(overall)';

async function fetchSettings(): Promise<CurationSettingsState> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('curation_settings').select('key, value');
  if (error) return DEFAULT_SETTINGS;

  const settings = { ...DEFAULT_SETTINGS };
  for (const row of data ?? []) {
    const enabled = Boolean((row.value as { enabled?: boolean } | null)?.enabled);
    if (row.key === 'featured_narratives_random') settings.featuredNarrativesRandom = enabled;
    if (row.key === 'featured_titles_random') settings.featuredTitlesRandom = enabled;
    if (row.key === 'featured_creators_random') settings.featuredCreatorsRandom = enabled;
  }
  return settings;
}

async function fetchTitles(): Promise<CurationTitle[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('titles')
    .select(BASE_TITLE_SELECT)
    .eq('hidden', false)
    .order('title_english', { ascending: true });

  if (error) return [];

  const weightsResult = await supabase.from('titles').select('id, featured_weight');
  const weights = new Map(
    weightsResult.error
      ? []
      : ((weightsResult.data ?? []) as TitleWeightRow[]).map((row) => [row.id, row.featured_weight ?? 50]),
  );

  return ((data ?? []) as unknown as TitleRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title_english: row.title_english,
    origin: row.origin,
    tier: row.tier,
    cover_slug: row.cover_slug,
    dominant_color: row.dominant_color,
    featured: row.featured,
    featured_order: row.featured_order ?? 0,
    featured_weight: weights.get(row.id) ?? 50,
    rating: row.ratings?.overall ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

async function fetchNarratives(): Promise<FeaturedNarrative[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('featured_narratives')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) return [];
  return (data ?? []) as FeaturedNarrative[];
}

async function fetchCreators(): Promise<CurationCreator[]> {
  const supabase = await createSupabaseServerClient();
  const { data: creators, error: creatorsError } = await supabase
    .from('creators')
    .select('id, slug, name, type, image, website, created_at, updated_at')
    .order('name', { ascending: true });

  if (creatorsError) return [];

  const [featuredResult, linksResult] = await Promise.all([
    supabase.from('featured_creators').select('creator_id, display_order, featured_weight, visible, updated_at'),
    supabase.from('title_creators').select('creator_id, title_id'),
  ]);

  const featuredByCreator = new Map(
    featuredResult.error
      ? []
      : ((featuredResult.data ?? []) as FeaturedCreatorRow[]).map((row) => [row.creator_id, row]),
  );

  const titleCounts = new Map<string, Set<string>>();
  if (!linksResult.error) {
    for (const link of (linksResult.data ?? []) as TitleCreatorRow[]) {
      const set = titleCounts.get(link.creator_id) ?? new Set<string>();
      set.add(link.title_id);
      titleCounts.set(link.creator_id, set);
    }
  }

  return ((creators ?? []) as CreatorRow[]).map((creator) => {
    const featured = featuredByCreator.get(creator.id);
    return {
      id: creator.id,
      slug: creator.slug,
      name: creator.name,
      type: creator.type,
      image: creator.image,
      website: creator.website,
      title_count: titleCounts.get(creator.id)?.size ?? 0,
      featured: Boolean(featured),
      display_order: featured?.display_order ?? 0,
      featured_weight: featured?.featured_weight ?? 50,
      visible: featured?.visible ?? false,
      created_at: creator.created_at,
      updated_at: featured?.updated_at ?? creator.updated_at ?? creator.created_at,
    };
  });
}

async function fetchMoodThemes(): Promise<MoodTheme[]> {
  const supabase = await createSupabaseServerClient();
  const { data: moods, error: moodsError } = await supabase
    .from('moods')
    .select('id, name, slug, description, atmosphere, sort_order, created_at')
    .order('sort_order', { ascending: true });

  if (moodsError) return [];

  const [configResult, titleMoodsResult] = await Promise.all([
    supabase.from('moods').select('id, cover_image, theme_color, visible, updated_at'),
    supabase.from('title_moods').select('mood_id, title_id, position').order('position', { ascending: true }),
  ]);

  const configByMood = new Map(
    configResult.error
      ? []
      : ((configResult.data ?? []) as MoodConfigRow[]).map((row) => [row.id, row]),
  );
  const titlesByMood = new Map<string, string[]>();

  if (!titleMoodsResult.error) {
    for (const link of (titleMoodsResult.data ?? []) as TitleMoodRow[]) {
      const ids = titlesByMood.get(link.mood_id) ?? [];
      ids.push(link.title_id);
      titlesByMood.set(link.mood_id, ids);
    }
  } else {
    const fallback = await supabase.from('title_moods').select('mood_id, title_id');
    if (!fallback.error) {
      for (const link of (fallback.data ?? []) as TitleMoodRow[]) {
        const ids = titlesByMood.get(link.mood_id) ?? [];
        ids.push(link.title_id);
        titlesByMood.set(link.mood_id, ids);
      }
    }
  }

  return ((moods ?? []) as MoodBaseRow[]).map((mood) => {
    const config = configByMood.get(mood.id);
    const titleIds = titlesByMood.get(mood.id) ?? [];
    return {
      id: mood.id,
      name: mood.name,
      slug: mood.slug,
      description: mood.description,
      cover_image: config?.cover_image ?? null,
      theme_color: config?.theme_color ?? mood.atmosphere?.accentColor ?? null,
      visible: config?.visible ?? true,
      sort_order: mood.sort_order ?? 0,
      titleIds,
      total_titles: titleIds.length,
      created_at: mood.created_at,
      updated_at: config?.updated_at ?? mood.created_at,
    };
  });
}

function fallbackTierDefinitions(titles: CurationTitle[]): TierDefinition[] {
  const order = Object.keys(TIER_CONFIG) as TierLevel[];
  return order.map((tier, index) => ({
    id: tier,
    slug: tier.toLowerCase().replace('+', '-plus'),
    name: tier,
    description: TIER_CONFIG[tier].description,
    color: TIER_CONFIG[tier].color,
    icon: null,
    display_order: index,
    visible: true,
    titleIds: titles.filter((title) => title.tier === tier).map((title) => title.id),
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  }));
}

async function fetchTierDefinitions(titles: CurationTitle[]): Promise<TierDefinition[]> {
  const supabase = await createSupabaseServerClient();
  const { data: tiers, error: tiersError } = await supabase
    .from('tier_definitions')
    .select('*')
    .order('display_order', { ascending: true });

  if (tiersError) return fallbackTierDefinitions(titles);

  const { data: tierTitles, error: tierTitlesError } = await supabase
    .from('tier_titles')
    .select('tier_id, title_id, position')
    .order('position', { ascending: true });

  const titlesByTier = new Map<string, string[]>();
  if (!tierTitlesError) {
    for (const link of (tierTitles ?? []) as TierTitleRow[]) {
      const ids = titlesByTier.get(link.tier_id) ?? [];
      ids.push(link.title_id);
      titlesByTier.set(link.tier_id, ids);
    }
  }

  return ((tiers ?? []) as TierDefinitionRow[]).map((tier) => ({
    id: tier.id,
    slug: tier.slug,
    name: tier.name,
    description: tier.description,
    color: tier.color,
    icon: tier.icon,
    display_order: tier.display_order,
    visible: tier.visible,
    titleIds: titlesByTier.get(tier.id) ?? titles.filter((title) => title.tier === tier.name).map((title) => title.id),
    created_at: tier.created_at,
    updated_at: tier.updated_at,
  }));
}

export async function fetchFeaturedCurationData(): Promise<FeaturedCurationData> {
  const [settings, titles, narratives, creators] = await Promise.all([
    fetchSettings(),
    fetchTitles(),
    fetchNarratives(),
    fetchCreators(),
  ]);

  return { settings, titles, narratives, creators };
}

export async function fetchMoodThemesData(): Promise<MoodThemesData> {
  const [titles, themes] = await Promise.all([fetchTitles(), fetchMoodThemes()]);
  return { titles, themes };
}

export async function fetchTiersData(): Promise<TiersData> {
  const titles = await fetchTitles();
  const tiers = await fetchTierDefinitions(titles);
  return { titles, tiers };
}
