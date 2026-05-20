// ============================================================
// Studio Articles Listing — Card-based list with state badges
// and confirmation-protected destructive actions.
// Server component that queries all articles regardless of state.
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, FileText, Star, Search } from 'lucide-react';
import { getServerUser } from '@/lib/db/supabase-server';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { studioFetchAllArticles, studioArchiveArticle, studioDeleteArticle } from '@/services/studio/studio-articles';
import type { StudioArticleRow } from '@/types/studio';
import type { PublicationState } from '@/types/article';
import { ArticleFilters } from '@/components/studio/ArticleFilters';
import { ArticleActions } from '@/components/studio/ArticleActions';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Manage your news and editorial content.',
};

// ── State badge config ──────────────────────────────────────────

const STATE_BADGE_CONFIG: Record<PublicationState, { label: string; bg: string; text: string; border: string }> = {
  draft: {
    label: 'Draft',
    bg: 'bg-white/10',
    text: 'text-text-tertiary',
    border: 'border-white/20',
  },
  scheduled: {
    label: 'Scheduled',
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  published: {
    label: 'Published',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
};

// ── Server Actions ──────────────────────────────────────────────

async function archiveArticleAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  const id = formData.get('id') as string;
  if (!id) return { success: false, error: 'Missing article ID.' };
  try {
    await studioArchiveArticle(id);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to archive article.' };
  }
}

async function deleteArticleAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  const id = formData.get('id') as string;
  if (!id) return { success: false, error: 'Missing article ID.' };
  try {
    await studioDeleteArticle(id);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete article.' };
  }
}

// ── Page component ──────────────────────────────────────────────

export default async function StudioArticlesPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const articles = await studioFetchAllArticles();

  return (
    <div className="container-content py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-accent-primary">
            Editorial
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Articles
          </h1>
          <p className="font-body text-sm text-text-secondary">
            {articles.length} article{articles.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>

        <Link
          href="/studio/articles/new"
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg min-h-[44px]',
            'bg-accent-primary text-white font-heading text-sm font-bold',
            'hover:bg-accent-primary/90 transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            'self-start sm:self-auto',
          )}
        >
          <Plus size={16} aria-hidden="true" />
          New Article
        </Link>
      </div>

      {/* Article List with Filters */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-bg-surface/60 flex items-center justify-center">
            <FileText size={24} className="text-text-tertiary" aria-hidden="true" />
          </div>
          <p className="font-body text-sm text-text-secondary max-w-xs">
            No articles yet. Start writing your first editorial piece.
          </p>
          <Link
            href="/studio/articles/new"
            className="font-heading text-sm text-accent-primary hover:text-accent-primary/80 transition-colors"
          >
            + Write your first article
          </Link>
        </div>
      ) : (
        <ArticleFilters articles={articles}>
          {(filtered) =>
            filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-bg-surface/60 flex items-center justify-center">
                  <Search size={20} className="text-text-tertiary" aria-hidden="true" />
                </div>
                <p className="font-body text-sm text-text-secondary max-w-xs">
                  No articles match your filters. Try adjusting your search.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )
          }
        </ArticleFilters>
      )}
    </div>
  );
}

// ── Article Card ────────────────────────────────────────────────

function ArticleCard({ article }: { article: StudioArticleRow }) {
  const stateConfig = STATE_BADGE_CONFIG[article.publicationState];
  const formattedDate = article.publishDate
    ? new Date(article.publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : article.scheduledDate
      ? `Scheduled: ${new Date(article.scheduledDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}`
      : 'No date';

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 rounded-lg',
        'sm:flex-row sm:items-center sm:justify-between',
        'bg-bg-surface/40 border border-white/5',
        'hover:border-white/10 hover:bg-bg-surface/60',
        'transition-all duration-200',
      )}
    >
      {/* Left: Article info */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {/* Title row with featured indicator */}
        <div className="flex items-center gap-2">
          {article.featured && (
            <Star
              size={14}
              className="text-accent-secondary shrink-0 fill-accent-secondary"
              aria-label="Featured article"
            />
          )}
          <h3 className="font-body text-sm font-medium text-text-primary leading-tight truncate">
            {article.title}
          </h3>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          {/* Publication state badge */}
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full border',
              'font-heading text-[10px] font-bold uppercase tracking-wider',
              stateConfig.bg,
              stateConfig.text,
              stateConfig.border,
            )}
          >
            {stateConfig.label}
          </span>

          {/* Publish date */}
          <span className="font-body text-text-tertiary">
            {formattedDate}
          </span>

          {/* Category */}
          {article.categoryName && (
            <span className="font-body text-text-secondary">
              {article.categoryName}
            </span>
          )}

          {/* Word count & reading time */}
          <span className="font-body text-text-tertiary">
            {article.wordCount.toLocaleString()} words · {article.readingTimeMinutes} min read
          </span>
        </div>
      </div>

      {/* Right: Actions with confirmation */}
      <ArticleActions
        articleId={article.id}
        articleSlug={article.slug}
        articleTitle={article.title}
        publicationState={article.publicationState}
        archiveAction={archiveArticleAction}
        deleteAction={deleteArticleAction}
      />
    </div>
  );
}
