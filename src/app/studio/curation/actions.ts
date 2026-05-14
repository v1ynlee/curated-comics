'use server';

// ============================================================
// Curation Server Actions — Persist featured title selections and order
// Requirements: 8.7
// ============================================================

import { createSupabaseServerClient, getServerUser } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

interface FeaturedUpdate {
  id: string;
  featured: boolean;
  featured_order: number;
}

export async function saveCuration(updates: FeaturedUpdate[]) {
  const user = await getServerUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createSupabaseServerClient();

  // Batch update all titles' featured status and order
  const results = await Promise.all(
    updates.map(({ id, featured, featured_order }) =>
      supabase
        .from('titles')
        .update({ featured, featured_order, updated_at: new Date().toISOString() })
        .eq('id', id),
    ),
  );

  const failed = results.filter((r) => r.error);
  if (failed.length > 0) {
    console.error('Curation save errors:', failed.map((f) => f.error));
    return { success: false, error: `Failed to update ${failed.length} title(s)` };
  }

  revalidatePath('/');
  revalidatePath('/studio/curation');

  return { success: true };
}
