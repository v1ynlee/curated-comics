// ============================================================
// Mood Service — Supabase queries
// Source of truth: docs/database/DATABASE_SCHEMA_PLANNING.md
// ============================================================

import { supabase } from '../api';
import type { Mood } from '@/types/title';

interface MoodRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  emoji: string | null;
  atmosphere: {
    gradient: string[];
    accentColor: string;
    particleColor?: string;
  };
  sort_order: number;
}

function mapMood(row: MoodRow): Mood {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    emoji: row.emoji ?? undefined,
    atmosphere: row.atmosphere,
  };
}

/**
 * Fetch all moods ordered by sort_order.
 */
export async function fetchMoods(): Promise<Mood[]> {
  const { data, error } = await supabase
    .from('moods')
    .select('id, name, slug, description, emoji, atmosphere, sort_order')
    .eq('visible', true)
    .order('sort_order', { ascending: true });

  if (error) {
    const fallback = await supabase
      .from('moods')
      .select('id, name, slug, description, emoji, atmosphere, sort_order')
      .order('sort_order', { ascending: true });

    if (fallback.error) throw new Error(`fetchMoods: ${fallback.error.message}`);
    return ((fallback.data ?? []) as MoodRow[]).map(mapMood);
  }
  return (data as MoodRow[]).map(mapMood);
}

/**
 * Fetch a single mood by slug.
 */
export async function fetchMood(slug: string): Promise<Mood | null> {
  const { data, error } = await supabase
    .from('moods')
    .select('id, name, slug, description, emoji, atmosphere, sort_order')
    .eq('slug', slug)
    .eq('visible', true)
    .single();

  if (error) {
    const fallback = await supabase
      .from('moods')
      .select('id, name, slug, description, emoji, atmosphere, sort_order')
      .eq('slug', slug)
      .single();

    if (!fallback.error) return mapMood(fallback.data as MoodRow);
    if (error.code === 'PGRST116') return null;
    throw new Error(`fetchMood: ${error.message}`);
  }
  return mapMood(data as MoodRow);
}
