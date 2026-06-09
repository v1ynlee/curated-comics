// ============================================================
// Narrative Service — homepage narrative curation
// ============================================================

import { supabase } from '../api';

export interface HomepageNarrative {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  coverSlugs: string[];
  accentColor: string;
  displayOrder: number;
  featuredWeight: number;
}

interface NarrativeRow {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cta_text: string | null;
  cta_href: string | null;
  cover_slugs: string[] | null;
  accent_color: string | null;
  display_order: number;
  featured_weight: number;
}

function mapNarrative(row: NarrativeRow): HomepageNarrative {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    description: row.description ?? undefined,
    ctaText: row.cta_text ?? undefined,
    ctaHref: row.cta_href ?? undefined,
    coverSlugs: row.cover_slugs ?? [],
    accentColor: row.accent_color ?? '#8b5cf6',
    displayOrder: row.display_order,
    featuredWeight: row.featured_weight,
  };
}

async function isRandomEnabled(): Promise<boolean> {
  const { data, error } = await supabase
    .from('curation_settings')
    .select('value')
    .eq('key', 'featured_narratives_random')
    .single();

  if (error) return false;
  return Boolean((data?.value as { enabled?: boolean } | null)?.enabled);
}

function weightedShuffle(items: HomepageNarrative[]) {
  const pool = [...items];
  const selected: HomepageNarrative[] = [];

  while (pool.length > 0) {
    const total = pool.reduce((sum, item) => sum + item.featuredWeight, 0);
    let cursor = Math.random() * total;
    const index = pool.findIndex((item) => {
      cursor -= item.featuredWeight;
      return cursor <= 0;
    });
    selected.push(...pool.splice(index < 0 ? 0 : index, 1));
  }

  return selected;
}

export async function fetchHomepageNarratives(): Promise<HomepageNarrative[]> {
  const randomEnabled = await isRandomEnabled();
  const { data, error } = await supabase
    .from('featured_narratives')
    .select('id, title, subtitle, description, cta_text, cta_href, cover_slugs, accent_color, display_order, featured_weight')
    .eq('visible', true)
    .order('display_order', { ascending: true });

  if (error) return [];

  const narratives = ((data as NarrativeRow[]) ?? []).map(mapNarrative);
  return randomEnabled ? weightedShuffle(narratives) : narratives;
}
