// ============================================================
// Studio Title Create Page — Server component that renders
// TitleEditor in create mode with genres/moods from Supabase.
// Requirements: 8.1, 8.2
// ============================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getServerUser } from '@/lib/supabase-server';
import { TitleEditor } from '@/components/studio/TitleEditor';
import type { TitleFormData } from '@/types/studio';

export const metadata: Metadata = {
  title: 'New Title — Studio',
  description: 'Add a new title to your collection.',
};

// ── Data fetching ───────────────────────────────────────────────

async function fetchGenres() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('genres')
    .select('id, name')
    .order('sort_order', { ascending: true });
  return data ?? [];
}

async function fetchMoods() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('moods')
    .select('id, name')
    .order('name', { ascending: true });
  return data ?? [];
}

// ── Server action: create title ─────────────────────────────────

async function createTitle(formData: TitleFormData): Promise<void> {
  'use server';

  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const supabase = await createSupabaseServerClient();

  // Generate slug from english title
  const slug = formData.englishTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Insert the title row
  const { data: title, error: titleError } = await supabase
    .from('titles')
    .insert({
      slug,
      title_english: formData.englishTitle,
      title_original: formData.originalTitle || null,
      title_alternative: formData.alternativeTitles?.length ? formData.alternativeTitles : null,
      origin: formData.origin,
      series_status: formData.seriesStatus,
      reading_status: formData.readingStatus,
      chapters_read: formData.chaptersRead ?? 0,
      total_chapters: formData.totalChapters ?? null,
      started_date: formData.startedDate || null,
      completed_date: formData.completedDate || null,
      last_read_date: formData.lastReadDate || null,
      tier: formData.tier,
      synopsis: formData.synopsis || null,
      vibe_check: formData.vibeCheck || null,
      quotable_lines: formData.quotableLines?.length ? formData.quotableLines : null,
      featured: formData.featured,
      hidden: formData.hidden,
      cover_slug: formData.coverImageId ? slug : null,
    })
    .select('id')
    .single();

  if (titleError) {
    throw new Error(`Failed to create title: ${titleError.message}`);
  }

  const titleId = title.id;

  // Insert genre associations
  if (formData.genres.length > 0) {
    const genreRows = formData.genres.map((genreId) => ({
      title_id: titleId,
      genre_id: genreId,
    }));
    const { error: genreError } = await supabase
      .from('title_genres')
      .insert(genreRows);
    if (genreError) {
      console.error('Failed to insert genre associations:', genreError);
    }
  }

  // Insert mood associations
  if (formData.moods.length > 0) {
    const moodRows = formData.moods.map((moodId) => ({
      title_id: titleId,
      mood_id: moodId,
    }));
    const { error: moodError } = await supabase
      .from('title_moods')
      .insert(moodRows);
    if (moodError) {
      console.error('Failed to insert mood associations:', moodError);
    }
  }

  // Insert review if provided
  if (formData.review?.trim()) {
    const wordCount = formData.review
      .split(/\s+/)
      .filter((token) => token.length > 0).length;

    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        title_id: titleId,
        body: formData.review,
        word_count: wordCount,
      });
    if (reviewError) {
      console.error('Failed to insert review:', reviewError);
    }
  }

  redirect(`/studio/titles/${slug}`);
}

// ── Page component ──────────────────────────────────────────────

export default async function StudioTitleNewPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const [genres, moods] = await Promise.all([fetchGenres(), fetchMoods()]);

  return (
    <div className="container-content py-10 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8">
        <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-accent-primary">
          Titles
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
          New Title
        </h1>
        <p className="font-body text-sm text-text-secondary">
          Add a new manga, manhwa, or manhua to your collection.
        </p>
      </div>

      {/* Editor */}
      <TitleEditor
        mode="create"
        onSave={createTitle}
        genres={genres}
        moods={moods}
      />
    </div>
  );
}
