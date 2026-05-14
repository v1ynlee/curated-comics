// ============================================================
// News Landing Page — Server Component
// Source of truth: .kiro/specs/platform-evolution-planning/requirements.md
//                  Requirements: 11.1, 11.2, 11.5, 14.4, 14.5
// ============================================================

import type { Metadata } from 'next';
import {
  fetchPublishedArticles,
  fetchFeaturedArticles,
  fetchArticleCategories,
  fetchArticleTags,
} from '@/services/articles';
import { ArticleCard } from '@/components/news/ArticleCard';
import { NewsFilters } from '@/components/news/NewsFilters';

export const metadata: Metadata = {
  title: 'News',
  description:
    'Industry news, editorial commentary, recommendations, and curated opinions on manga, manhwa, and manhua.',
  openGraph: {
    title: 'News — Comic Curated',
    description:
      'Industry news, editorial commentary, recommendations, and curated opinions.',
    type: 'website',
  },
};

interface NewsPageProps {
  searchParams: Promise<{ category?: string; tag?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const activeCategory = params.category ?? null;
  const activeTag = params.tag ?? null;

  // Fetch data in parallel
  const [articles, featuredArticles, categories, tags] = await Promise.all([
    fetchPublishedArticles({
      category: activeCategory ?? undefined,
      tag: activeTag ?? undefined,
    }),
    fetchFeaturedArticles(),
    fetchArticleCategories(),
    fetchArticleTags(),
  ]);

  // Filter out featured articles from the main grid to avoid duplication
  const featuredIds = new Set(featuredArticles.map((a) => a.id));
  const recentArticles = articles.filter((a) => !featuredIds.has(a.id));

  return (
    <div className="container-content pt-6 md:pt-24 pb-16">
      {/* Page header */}
      <div className="flex flex-col gap-2 mb-10">
        <span className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary">
          Editorial
        </span>
        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold text-text-primary leading-tight">
          News
        </h1>
        <p className="font-body text-text-secondary max-w-lg">
          Industry updates, curated recommendations, and editorial commentary on
          manga, manhwa, and manhua.
        </p>
      </div>

      {/* Featured section */}
      {featuredArticles.length > 0 && !activeCategory && !activeTag && (
        <section aria-labelledby="featured-heading" className="mb-12">
          <h2
            id="featured-heading"
            className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary mb-6"
          >
            Featured
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                featured
                priority
              />
            ))}
          </div>
        </section>
      )}

      {/* Filter controls */}
      <section aria-label="Article filters" className="mb-8">
        <NewsFilters
          categories={categories}
          tags={tags}
          activeCategory={activeCategory}
          activeTag={activeTag}
        />
      </section>

      {/* Recent articles grid */}
      <section aria-labelledby="recent-heading">
        <h2
          id="recent-heading"
          className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary mb-6"
        >
          {activeCategory || activeTag ? 'Filtered Articles' : 'Recent Articles'}
        </h2>

        {recentArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-text-secondary font-body text-lg mb-2">
              No articles found
            </p>
            <p className="text-text-tertiary font-body text-sm">
              {activeCategory || activeTag
                ? 'Try adjusting your filters to find more content.'
                : 'Check back soon for new editorial content.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
