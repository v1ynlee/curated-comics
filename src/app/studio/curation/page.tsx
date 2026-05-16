// ============================================================
// Studio Curation Page — Homepage featured titles, curated
// collections, and mood/theme curation management.
// Server component that fetches all titles, collections, and
// mood curations for the interactive client interface.
// Requirements: 8.7, 9.4, 18.1, 18.2, 18.3, 18.4, 18.5
// ============================================================

import type { Metadata } from 'next';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { redirect } from 'next/navigation';
import { CurationInterface } from './CurationInterface';
import type { CollectionCategory } from './actions';

export const metadata: Metadata = {
  title: 'Curation',
  description: 'Manage featured titles, curated collections, and mood/theme curations.',
};

// ── Types ───────────────────────────────────────────────────────

export interface CurationTitle {
  id: string;
  slug: string;
  title_english: string;
  origin: 'manhwa' | 'manga' | 'manhua';
  tier: string | null;
  cover_slug: string | null;
  dominant_color: string | null;
  featured: boolean;
  featured_order: number;
}

export interface CuratedCollectionWithTitles {
  id: string;
  name: string;
  slug: string;
  category: CollectionCategory;
  description: string | null;
  created_at: string;
  updated_at: string;
  titleIds: string[];
}

export interface MoodCurationWithTitles {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  titleIds: string[];
}

// ── Data fetching ───────────────────────────────────────────────

async function fetchAllTitles(): Promise<CurationTitle[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('titles')
    .select(
      'id, slug, title_english, origin, tier, cover_slug, dominant_color, featured, featured_order',
    )
    .eq('hidden', false)
    .order('title_english', { ascending: true });

  if (error) {
    console.error('Failed to fetch titles for curation:', error);
    return [];
  }

  return (data ?? []) as CurationTitle[];
}

async function fetchCollections(): Promise<CuratedCollectionWithTitles[]> {
  const supabase = await createSupabaseServerClient();

  const { data: collections, error: collError } = await supabase
    .from('curated_collections')
    .select('*')
    .order('created_at', { ascending: false });

  if (collError) {
    console.error('Failed to fetch curated collections:', collError);
    return [];
  }

  if (!collections || collections.length === 0) return [];

  // Fetch all collection-title relationships
  const { data: collTitles, error: ctError } = await supabase
    .from('collection_titles')
    .select('collection_id, title_id, position')
    .in('collection_id', collections.map((c) => c.id))
    .order('position', { ascending: true });

  if (ctError) {
    console.error('Failed to fetch collection titles:', ctError);
  }

  const titlesByCollection = new Map<string, string[]>();
  (collTitles ?? []).forEach((ct) => {
    const existing = titlesByCollection.get(ct.collection_id) ?? [];
    existing.push(ct.title_id);
    titlesByCollection.set(ct.collection_id, existing);
  });

  return collections.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    category: c.category as CollectionCategory,
    description: c.description,
    created_at: c.created_at,
    updated_at: c.updated_at,
    titleIds: titlesByCollection.get(c.id) ?? [],
  }));
}

async function fetchMoodCurations(): Promise<MoodCurationWithTitles[]> {
  const supabase = await createSupabaseServerClient();

  const { data: moods, error: moodError } = await supabase
    .from('mood_curations')
    .select('*')
    .order('created_at', { ascending: false });

  if (moodError) {
    console.error('Failed to fetch mood curations:', moodError);
    return [];
  }

  if (!moods || moods.length === 0) return [];

  // Fetch all mood-title relationships
  const { data: moodTitles, error: mtError } = await supabase
    .from('mood_curation_titles')
    .select('curation_id, title_id, position')
    .in('curation_id', moods.map((m) => m.id))
    .order('position', { ascending: true });

  if (mtError) {
    console.error('Failed to fetch mood curation titles:', mtError);
  }

  const titlesByMood = new Map<string, string[]>();
  (moodTitles ?? []).forEach((mt) => {
    const existing = titlesByMood.get(mt.curation_id) ?? [];
    existing.push(mt.title_id);
    titlesByMood.set(mt.curation_id, existing);
  });

  return moods.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    description: m.description,
    created_at: m.created_at,
    updated_at: m.updated_at,
    titleIds: titlesByMood.get(m.id) ?? [],
  }));
}

// ── Page component ──────────────────────────────────────────────

export default async function StudioCurationPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const [titles, collections, moodCurations] = await Promise.all([
    fetchAllTitles(),
    fetchCollections(),
    fetchMoodCurations(),
  ]);

  return (
    <div className="container-content py-10 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-accent-primary">
          Content Management
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
          Curation
        </h1>
        <p className="font-body text-sm text-text-secondary">
          Manage featured titles, curated collections, and mood/theme groupings for public discovery.
        </p>
      </div>

      <CurationInterface
        titles={titles}
        collections={collections}
        moodCurations={moodCurations}
      />
    </div>
  );
}
