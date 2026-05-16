// ============================================================
// App-Wide Constants
// Source of truth: docs/architecture/CONTENT_STRUCTURE.md
//                  docs/branding/BRANDING_DIRECTION.md
// ============================================================

import type { Genre, Mood } from '@/types/title';

// ── Site Metadata ─────────────────────────────────────────────

export const SITE_NAME = 'Comic Curated';
export const SITE_DESCRIPTION =
  'A cinematic personal comic-reading showcase — Korean manhwa, Chinese manhua, and Japanese manga.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://comic-curated.com';

// ── Breakpoints (matches Tailwind config) ─────────────────────

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ── Genres ────────────────────────────────────────────────────

export const GENRES: Omit<Genre, 'id'>[] = [
  { name: 'Action', slug: 'action', color: '#EF4444' },
  { name: 'Adventure', slug: 'adventure', color: '#F59E0B' },
  { name: 'Comedy', slug: 'comedy', color: '#FCD34D' },
  { name: 'Drama', slug: 'drama', color: '#8B5CF6' },
  { name: 'Fantasy', slug: 'fantasy', color: '#6366F1' },
  { name: 'Horror', slug: 'horror', color: '#1F2937' },
  { name: 'Martial Arts', slug: 'martial-arts', color: '#DC2626' },
  { name: 'Murim', slug: 'murim', color: '#B91C1C' },
  { name: 'Mystery', slug: 'mystery', color: '#4B5563' },
  { name: 'Psychological', slug: 'psychological', color: '#7C3AED' },
  { name: 'Regression', slug: 'regression', color: '#2563EB' },
  { name: 'Reincarnation', slug: 'reincarnation', color: '#0EA5E9' },
  { name: 'Romance', slug: 'romance', color: '#EC4899' },
  { name: 'School Life', slug: 'school-life', color: '#10B981' },
  { name: 'Sci-Fi', slug: 'sci-fi', color: '#06B6D4' },
  { name: 'Slice of Life', slug: 'slice-of-life', color: '#34D399' },
  { name: 'Sports', slug: 'sports', color: '#F97316' },
  { name: 'Supernatural', slug: 'supernatural', color: '#A855F7' },
  { name: 'System', slug: 'system', color: '#3B82F6' },
  { name: 'Thriller', slug: 'thriller', color: '#374151' },
  { name: 'Tower', slug: 'tower', color: '#6D28D9' },
  { name: 'Villainess', slug: 'villainess', color: '#BE185D' },
  { name: 'Wuxia', slug: 'wuxia', color: '#991B1B' },
];

// ── Moods ─────────────────────────────────────────────────────

export const MOODS: Omit<Mood, 'id' | 'atmosphere'>[] = [
  { name: 'Depression Arc', slug: 'depression-arc', description: 'Emotionally devastating reads that hit different', emoji: '🖤' },
  { name: 'Aura Farming', slug: 'aura-farming', description: 'MC radiates so much presence it\'s unreal', emoji: '✨' },
  { name: 'Brainrot', slug: 'brainrot', description: 'Addictive to the point of no return', emoji: '🧠' },
  { name: 'Manipulator MC', slug: 'manipulator-mc', description: 'Chess master protagonists playing 4D chess', emoji: '🎭' },
  { name: 'Comfy Slice of Life', slug: 'comfy-sol', description: 'Warm, cozy, no stress allowed', emoji: '☕' },
  { name: 'Revenge Fantasy', slug: 'revenge-fantasy', description: 'Satisfying payback arcs', emoji: '🔥' },
  { name: 'Murim Addiction', slug: 'murim-addiction', description: 'Martial arts cultivation crack', emoji: '⚔️' },
  { name: 'Power Fantasy', slug: 'power-fantasy', description: 'Overpowered MC doing overpowered things', emoji: '💪' },
  { name: 'Emotional Damage', slug: 'emotional-damage', description: 'Will make you cry in the shower', emoji: '💔' },
  { name: 'Villainess Era', slug: 'villainess-era', description: 'Reincarnated as the villain and thriving', emoji: '👑' },
  { name: 'Necromancer Vibes', slug: 'necromancer-vibes', description: 'Undead armies and dark magic', emoji: '💀' },
  { name: 'Regression Loop', slug: 'regression-loop', description: 'Time travel do-overs done right', emoji: '🔄' },
  { name: 'Tower Climbing', slug: 'tower-climbing', description: 'Floor by floor, getting stronger', emoji: '🗼' },
  { name: 'System Addict', slug: 'system-addict', description: 'Stat screens and level-up dopamine', emoji: '📊' },
  { name: 'Art So Good It Hurts', slug: 'art-god', description: 'Visual masterpieces', emoji: '🎨' },
  { name: 'Guilty Pleasure Trash', slug: 'guilty-trash', description: 'Objectively bad, subjectively perfect', emoji: '🗑️' },
];

// ── Platform Config ───────────────────────────────────────────

export const PLATFORM_CONFIG = {
  webtoon: { name: 'Webtoon', color: '#00D564' },
  kakaopage: { name: 'KakaoPage', color: '#FFCD00' },
  naver: { name: 'Naver', color: '#03C75A' },
  tapas: { name: 'Tapas', color: '#FF5A5F' },
  mangadex: { name: 'MangaDex', color: '#FF6740' },
  tappytoon: { name: 'Tappytoon', color: '#7B5EA7' },
  lezhin: { name: 'Lezhin', color: '#E63946' },
  official: { name: 'Official', color: '#6B7280' },
  other: { name: 'Other', color: '#6B7280' },
} as const;

// ── Reading Status Labels ─────────────────────────────────────

export const READING_STATUS_LABELS: Record<string, string> = {
  reading: 'Currently Reading',
  completed: 'Completed',
  dropped: 'Dropped',
  paused: 'Paused',
  wishlist: 'Wishlist',
  'hidden-gem': 'Hidden Gems',
  'guilty-pleasure': 'Guilty Pleasures',
  'top-favorite': 'Top Favorites',
  'most-reread': 'Most Re-read',
};
