// ============================================================
// Studio Curation Page — Homepage featured titles management
// Server component that fetches all titles and their featured status.
// Includes client component for interactive drag-and-drop curation.
// Requirements: 8.7, 9.4
// ============================================================

import type { Metadata } from 'next';
import { createSupabaseServerClient, getServerUser } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { CurationInterface } from './CurationInterface';

export const metadata: Metadata = {
  title: 'Homepage Curation',
  description: 'Select and order featured titles for the homepage.',
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

// ── Page component ──────────────────────────────────────────────

export default async function StudioCurationPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const titles = await fetchAllTitles();

  return (
    <div className="container-content py-10 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-accent-primary">
          Homepage
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
          Curation
        </h1>
        <p className="font-body text-sm text-text-secondary">
          Select featured titles and control their display order on the homepage.
        </p>
      </div>

      <CurationInterface titles={titles} />
    </div>
  );
}
