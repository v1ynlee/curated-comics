// ============================================================
// Studio Title Edit Page — Server component that loads existing
// title data by slug and renders TitleEditor in edit mode.
// Requirements: 8.1, 8.2
// ============================================================

import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient, getServerUser } from '@/lib/supabase-server';
import { TitleEditor } from '@/components/studio/TitleEditor';
import type { TitleFormData } from '@/types/studio';

// ── Metadata ────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('titles')
    .select('title_english')
    .eq('slug', slug)
    .single();

  return {
    title: data ? `Edit: ${data.title_english} — Studio` : 'Edit Title — Studio',
    description: 'Edit title details.',
  };
}

// ── Data fetching ───────────────────────────────────────────────

async function fetchTitle(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('titles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

async function fetchTitleGenres(titleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('title_genres')
    .select('genre_id')
    .eq('title_id', titleId);
  return (data ?? []).map((row) => row.genre_id);
}

async function fetchTitleMoods(titleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('title_moods')
    .select('mood_id')
    .eq('title_id', titleId);
  return (data ?? []).map((row) => row.mood_id);
}

async function fetchTitleReview(titleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('reviews')
    .select('body')
    .eq('title_id', titleId)
    .single();
  return data?.body ?? '';
}

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

// ── Server action factory: update title ──────────────────────────

function createUpdateAction(titleId: string) {
  return async function updateTitle(formData: TitleFormData): Promise<void> {
    'use server';

    const user = await getServerUser();
    if (!user) redirect('/studio/login');

    const supabase = await createSupabaseServerClient();

    // Update the title row
    const { error: updateError } = await supabase
      .from('titles')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', titleId);

    if (updateError) {
      throw new Error(`Failed to update title: ${updateError.message}`);
    }

    // Replace genre associations (delete all, re-insert)
    await supabase.from('title_genres').delete().eq('title_id', titleId);
    if (formData.genres.length > 0) {
      const genreRows = formData.genres.map((genreId) => ({
        title_id: titleId,
        genre_id: genreId,
      }));
      const { error: genreError } = await supabase
        .from('title_genres')
        .insert(genreRows);
      if (genreError) {
        console.error('Failed to update genre associations:', genreError);
      }
    }

    // Replace mood associations (delete all, re-insert)
    await supabase.from('title_moods').delete().eq('title_id', titleId);
    if (formData.moods.length > 0) {
      const moodRows = formData.moods.map((moodId) => ({
        title_id: titleId,
        mood_id: moodId,
      }));
      const { error: moodError } = await supabase
        .from('title_moods')
        .insert(moodRows);
      if (moodError) {
        console.error('Failed to update mood associations:', moodError);
      }
    }

    // Upsert review (insert or update)
    if (formData.review?.trim()) {
      const wordCount = formData.review
        .split(/\s+/)
        .filter((token) => token.length > 0).length;

      const { error: reviewError } = await supabase
        .from('reviews')
        .upsert(
          {
            title_id: titleId,
            body: formData.review,
            word_count: wordCount,
            last_edited: new Date().toISOString(),
          },
          { onConflict: 'title_id' },
        );
      if (reviewError) {
        console.error('Failed to upsert review:', reviewError);
      }
    } else {
      // If review is cleared, delete it
      await supabase.from('reviews').delete().eq('title_id', titleId);
    }

    redirect('/studio/titles');
  };
}

// ── Page component ──────────────────────────────────────────────

export default async function StudioTitleEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const { slug } = await params;
  const title = await fetchTitle(slug);

  if (!title) {
    notFound();
  }

  // Fetch related data in parallel
  const [titleGenres, titleMoods, review, genres, moods] = await Promise.all([
    fetchTitleGenres(title.id),
    fetchTitleMoods(title.id),
    fetchTitleReview(title.id),
    fetchGenres(),
    fetchMoods(),
  ]);

  // Map database row to TitleFormData
  const initialData: TitleFormData = {
    englishTitle: title.title_english,
    originalTitle: title.title_original ?? '',
    alternativeTitles: title.title_alternative ?? [],
    origin: title.origin,
    seriesStatus: title.series_status,
    readingStatus: title.reading_status,
    chaptersRead: title.chapters_read ?? undefined,
    totalChapters: title.total_chapters ?? undefined,
    startedDate: title.started_date ?? '',
    completedDate: title.completed_date ?? '',
    lastReadDate: title.last_read_date
      ? new Date(title.last_read_date).toISOString().split('T')[0]
      : '',
    tier: title.tier ?? 'B',
    synopsis: title.synopsis ?? '',
    vibeCheck: title.vibe_check ?? '',
    quotableLines: title.quotable_lines ?? [],
    review,
    featured: title.featured,
    hidden: title.hidden,
    genres: titleGenres,
    moods: titleMoods,
    coverImageId: undefined,
    bannerImageId: undefined,
  };

  // Create the update action bound to this title's ID
  const updateTitle = createUpdateAction(title.id);

  return (
    <div className="container-content py-10 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8">
        <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-accent-primary">
          Titles
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
          Edit: {title.title_english}
        </h1>
        <p className="font-body text-sm text-text-secondary">
          Update title details, classification, and media.
        </p>
      </div>

      {/* Editor */}
      <TitleEditor
        mode="edit"
        initialData={initialData}
        onSave={updateTitle}
        genres={genres}
        moods={moods}
      />
    </div>
  );
}
