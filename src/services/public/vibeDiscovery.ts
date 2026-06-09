// ============================================================
// Vibe Discovery Service — enriched mood data for /discover
//
// Batches 3 Supabase queries in parallel:
//   1. moods + all editorial metadata columns
//   2. mood_discovery_stats view — derived title counts / timestamps
//   3. mood_collage_covers — manual curation (falls back to auto)
//
// Returns EnrichedMood[] sorted by sort_order.
// ============================================================

import { supabase } from '../api';
import type { EnrichedMood, VibeBadge, CoverPreview } from '@/types/title';

// ── Row types ─────────────────────────────────────────────────

interface MoodMetaRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  emoji: string | null;
  atmosphere: {
    gradient: string[];
    accentColor: string;
    particleColor?: string;
    ambientAnimation?: string;
  };
  sort_order: number;
  badge: VibeBadge | null;
  featured_priority: number;
  featured_slot: string | null;
  featured_until: string | null;
  popularity_score: number;
  editor_note: string | null;
  atmosphere_config: Record<string, unknown>;
}

interface StatsRow {
  mood_id: string;
  title_count: string; // Supabase returns COUNT as string
  last_title_added_at: string | null;
  titles_added_this_month: string;
}

interface CollageRow {
  mood_id: string;
  title_id: string;
  position: number;
  titles: {
    cover_slug: string | null;
    slug: string;
    dominant_color: string | null;
  };
}

interface AutoCoverRow {
  mood_id: string;
  title_id: string;
  titles: {
    cover_slug: string | null;
    slug: string;
    dominant_color: string | null;
  };
  ratings: { overall: number } | null;
}

// ── Mapper ────────────────────────────────────────────────────

function mapEnrichedMood(
  meta: MoodMetaRow,
  stats: StatsRow | undefined,
  covers: CoverPreview[],
  isManual: boolean,
): EnrichedMood {
  return {
    // Base Mood fields
    id: meta.id,
    name: meta.name,
    slug: meta.slug,
    description: meta.description,
    emoji: meta.emoji ?? undefined,
    atmosphere: meta.atmosphere,
    // Editorial
    badge: meta.badge,
    featuredPriority: meta.featured_priority,
    featuredSlot: meta.featured_slot,
    featuredUntil: meta.featured_until,
    popularityScore: meta.popularity_score,
    editorNote: meta.editor_note,
    atmosphereConfig: meta.atmosphere_config ?? {},
    // Derived stats
    titleCount: stats ? parseInt(stats.title_count, 10) : 0,
    lastTitleAddedAt: stats?.last_title_added_at ?? null,
    titlesAddedThisMonth: stats ? parseInt(stats.titles_added_this_month, 10) : 0,
    // Collage
    collageCovers: covers,
    isManualCollage: isManual,
  };
}

// ── Main fetch ────────────────────────────────────────────────

/**
 * Fetch all moods with enriched discovery metadata.
 *
 * Execution plan:
 *   - Query 1: moods with all new editorial columns
 *   - Query 2: mood_discovery_stats view for real-time counts
 *   - Query 3: mood_collage_covers for manual cover curation
 *   - For any mood with no manual covers: auto-select via title_moods + ratings
 */
export async function fetchVibeDiscoveryData(): Promise<EnrichedMood[]> {
  // ── 1. Mood metadata ────────────────────────────────────────
  const [moodsResult, statsResult, collageResult] = await Promise.all([
    supabase
      .from('moods')
      .select(
        'id, name, slug, description, emoji, atmosphere, sort_order, ' +
        'badge, featured_priority, featured_slot, featured_until, ' +
        'popularity_score, editor_note, atmosphere_config',
      )
      .order('sort_order', { ascending: true }),

    supabase
      .from('mood_discovery_stats')
      .select('mood_id, title_count, last_title_added_at, titles_added_this_month'),

    supabase
      .from('mood_collage_covers')
      .select('mood_id, title_id, position, titles(cover_slug, slug, dominant_color)')
      .order('position', { ascending: true }),
  ]);

  if (moodsResult.error) throw new Error(`fetchVibeDiscoveryData moods: ${moodsResult.error.message}`);
  if (statsResult.error)  throw new Error(`fetchVibeDiscoveryData stats: ${statsResult.error.message}`);
  // Collage errors are non-fatal — fall through to auto selection

  const moods   = (moodsResult.data ?? []) as unknown as MoodMetaRow[];
  const stats   = (statsResult.data  ?? []) as unknown as StatsRow[];
  const collage = (collageResult.data ?? []) as unknown as CollageRow[];

  // Build lookup maps
  const statsMap = new Map<string, StatsRow>(stats.map((s) => [s.mood_id, s]));

  // Group manual covers by mood_id
  const manualMap = new Map<string, CoverPreview[]>();
  for (const row of collage) {
    const existing = manualMap.get(row.mood_id) ?? [];
    existing.push({
      slug: row.titles?.cover_slug ?? row.titles?.slug ?? 'placeholder',
      dominantColor: row.titles?.dominant_color ?? '#1a1a2e',
    });
    manualMap.set(row.mood_id, existing);
  }

  // Identify moods that need auto-fallback covers (no manual entries)
  const moodsNeedingAuto = moods
    .filter((m) => !manualMap.has(m.id) || (manualMap.get(m.id)?.length ?? 0) === 0)
    .map((m) => m.id);

  // ── Auto-fallback: top-rated titles per mood ───────────────
  const autoMap = new Map<string, CoverPreview[]>();
  if (moodsNeedingAuto.length > 0) {
    const { data: autoData } = await supabase
      .from('title_moods')
      .select('mood_id, title_id, titles(cover_slug, slug, dominant_color), ratings(overall)')
      .in('mood_id', moodsNeedingAuto)
      .not('titles', 'is', null)
      .order('ratings.overall', { ascending: false })
      .limit(moodsNeedingAuto.length * 6);

    if (autoData) {
      for (const row of autoData as unknown as AutoCoverRow[]) {
        const existing = autoMap.get(row.mood_id) ?? [];
        if (existing.length < 6) {
          existing.push({
            slug: row.titles?.cover_slug ?? row.titles?.slug ?? 'placeholder',
            dominantColor: row.titles?.dominant_color ?? '#1a1a2e',
          });
          autoMap.set(row.mood_id, existing);
        }
      }
    }
  }

  // ── Assemble final result ──────────────────────────────────
  return moods.map((meta) => {
    const manual = manualMap.get(meta.id);
    const hasManual = manual && manual.length > 0;
    const covers = hasManual ? manual : (autoMap.get(meta.id) ?? []);
    return mapEnrichedMood(meta, statsMap.get(meta.id), covers, hasManual ?? false);
  });
}
