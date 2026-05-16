// ============================================================
// Statistics Service — Supabase queries
// Source of truth: docs/database/DATABASE_SCHEMA_PLANNING.md
//                  docs/architecture/CONTENT_STRUCTURE.md
// ============================================================

import { supabase } from '../api';
import type { ReadingStatistics } from '@/types/stats';
import { estimateReadingHours } from '@/lib/utils/utils';

/**
 * Fetch all reading statistics from the database views + tables.
 * Combines data from reading_statistics view, genre_distribution view,
 * monthly_reading view, and titles table.
 */
export async function fetchReadingStatistics(): Promise<ReadingStatistics> {
  // Run all queries in parallel
  const [
    statsResult,
    genreResult,
    monthlyResult,
    originResult,
    tierResult,
    statusResult,
  ] = await Promise.all([
    // Aggregate stats from the view
    supabase.from('reading_statistics').select('*').single(),

    // Genre distribution
    supabase
      .from('genre_distribution')
      .select('name, title_count')
      .order('title_count', { ascending: false })
      .limit(12),

    // Monthly reading (last 12 months)
    supabase
      .from('monthly_reading')
      .select('month, chapters')
      .order('month', { ascending: false })
      .limit(12),

    // Origin distribution
    supabase
      .from('titles')
      .select('origin')
      .eq('hidden', false),

    // Tier distribution
    supabase
      .from('titles')
      .select('tier')
      .eq('hidden', false)
      .not('tier', 'is', null),

    // Status distribution
    supabase
      .from('titles')
      .select('reading_status')
      .eq('hidden', false),
  ]);

  // ── Aggregate stats ───────────────────────────────────────
  const stats = statsResult.data as {
    total_titles: number;
    total_chapters: number;
    estimated_hours: number;
    average_rating: number;
    completed_count: number;
    dropped_count: number;
    completion_rate: number;
  } | null;

  const totalTitles = stats?.total_titles ?? 0;
  const totalChaptersRead = stats?.total_chapters ?? 0;
  const estimatedReadingHoursVal = stats?.estimated_hours ?? estimateReadingHours(totalChaptersRead);
  const averageRating = stats?.average_rating ? Number(stats.average_rating.toFixed(2)) : 0;
  const completionRate = stats?.completion_rate ?? 0;
  const averageChaptersPerTitle = totalTitles > 0 ? Math.round(totalChaptersRead / totalTitles) : 0;

  // ── Genre distribution ────────────────────────────────────
  const genreDistribution: Record<string, number> = {};
  for (const row of (genreResult.data ?? []) as { name: string; title_count: number }[]) {
    if (row.title_count > 0) {
      genreDistribution[row.name] = row.title_count;
    }
  }

  // ── Monthly chapters ──────────────────────────────────────
  const monthlyChapters = ((monthlyResult.data ?? []) as { month: string; chapters: number }[])
    .map((row) => ({
      month: row.month,
      count: row.chapters ?? 0,
    }))
    .reverse(); // Chronological order

  // ── Origin distribution ───────────────────────────────────
  const originDistribution: Record<string, number> = {};
  for (const row of (originResult.data ?? []) as { origin: string }[]) {
    originDistribution[row.origin] = (originDistribution[row.origin] ?? 0) + 1;
  }

  // ── Tier distribution ─────────────────────────────────────
  const tierDistribution: Record<string, number> = {};
  for (const row of (tierResult.data ?? []) as { tier: string }[]) {
    if (row.tier) {
      tierDistribution[row.tier] = (tierDistribution[row.tier] ?? 0) + 1;
    }
  }

  // ── Status distribution ───────────────────────────────────
  const statusDistribution: Record<string, number> = {};
  for (const row of (statusResult.data ?? []) as { reading_status: string }[]) {
    statusDistribution[row.reading_status] = (statusDistribution[row.reading_status] ?? 0) + 1;
  }

  // ── Yearly titles ─────────────────────────────────────────
  // Derive from monthly data
  const yearlyMap = new Map<number, number>();
  for (const m of monthlyChapters) {
    const year = new Date(m.month).getFullYear();
    yearlyMap.set(year, (yearlyMap.get(year) ?? 0) + 1);
  }
  const yearlyTitles = Array.from(yearlyMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);

  // ── Reading streak (simplified — based on monthly activity) ──
  // A real streak requires reading_history table with daily granularity.
  // For now, count consecutive months with activity.
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedMonths = [...monthlyChapters].sort(
    (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime(),
  );
  for (const m of sortedMonths) {
    if (m.count > 0) {
      tempStreak++;
      if (currentStreak === 0) currentStreak = tempStreak;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      if (currentStreak === 0) currentStreak = 0;
      tempStreak = 0;
    }
  }

  return {
    totalTitles,
    totalChaptersRead,
    estimatedReadingHours: estimatedReadingHoursVal,
    genreDistribution,
    moodDistribution: {}, // Requires join — populated separately if needed
    originDistribution,
    tierDistribution,
    statusDistribution,
    monthlyChapters,
    yearlyTitles,
    readingStreak: { current: currentStreak, longest: longestStreak },
    averageRating,
    averageChaptersPerTitle,
    completionRate,
  };
}
