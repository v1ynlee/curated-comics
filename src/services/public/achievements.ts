// ============================================================
// Achievements Service — Supabase queries
// Source of truth: docs/database/DATABASE_SCHEMA_PLANNING.md
// ============================================================

import { supabase } from '../api';
import type { Achievement, AchievementCondition } from '@/types/achievements';

interface AchievementRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_target: number;
  condition_filter: Record<string, unknown> | null;
  current_progress: number;
  unlocked: boolean;
  unlocked_date: string | null;
  rarity: string;
  color: string;
  glow_effect: boolean;
  sort_order: number;
}

function mapAchievement(row: AchievementRow): Achievement {
  const condition: AchievementCondition = {
    type: row.condition_type as AchievementCondition['type'],
    target: row.condition_target,
    current: row.current_progress,
    filter: row.condition_filter ?? undefined,
  };

  const progress = Math.min(100, Math.round((row.current_progress / row.condition_target) * 100));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    condition,
    progress,
    unlocked: row.unlocked,
    unlockedDate: row.unlocked_date ?? undefined,
    rarity: row.rarity as Achievement['rarity'],
    color: row.color,
    glowEffect: row.glow_effect,
  };
}

/**
 * Fetch all achievements ordered by sort_order.
 */
export async function fetchAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`fetchAchievements: ${error.message}`);
  return (data as AchievementRow[]).map(mapAchievement);
}
