// ============================================================
// News Landing Page — Server Component
// Supports URL-driven search, filters, pagination, and streaming
// loading states for the editorial news archive.
// ============================================================

import type { Metadata } from "next";
import { Suspense } from "react";
import { FileText } from "lucide-react";
import {
  fetchPublishedArticles,
  fetchFeaturedArticles,
  fetchArticleCategories,
  fetchArticleTags,
  countPublishedArticles,
  NEWS_PAGE_SIZE,
  normalizeArticleSort,
  type ArticleSort,
} from "@/services/public/articles";
import { ArticleCard } from "@/components/news/ArticleCard";
import { NewsFilters } from "@/components/news/NewsFilters";
import { NewsPagination } from "@/components/news/NewsPagination";
import {
  NewsFiltersSkeleton,
  NewsResultsSkeleton,
} from "@/components/news/ArticleGridSkeleton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PageHeading } from "@/components/ui/PageHeading";

export const metadata: Metadata = {
  title: "News",
  description:
    "Industry news, editorial commentary, recommendations, and curated opinions on manga, manhwa, and manhua.",
  openGraph: {
    title: "News — Comic Curated",
    description:
      "Industry news, editorial commentary, recommendations, and curated opinions.",
    type: "website",
  },
};

interface NewsPageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    page?: string;
    q?: string;
    sort?: string;
  }>;
}

interface NewsQueryState {
  activeCategory: string | null;
  activeTag: string | null;
  searchQuery: string | null;
  activeSort: ArticleSort;
  currentPage: number;
}

function parseCurrentPage(page?: string): number {
  const parsed = Number.parseInt(page ?? "1", 10);
  return Number.isFinite(parsed) ? Math.max(1, parsed) : 1;
}

async function NewsFilterSection({
  activeCategory,
  activeTag,
  searchQuery,
  activeSort,
}: NewsQueryState) {
  const [categories, tags] = await Promise.all([
    fetchArticleCategories(),
    fetchArticleTags(),
  ]);

  return (
    <NewsFilters
      key={`${activeCategory ?? "all"}-${activeTag ?? "all"}-${searchQuery ?? "none"}-${activeSort}`}
      categories={categories}
      tags={tags}
      activeCategory={activeCategory}
      activeTag={activeTag}
      activeSearch={searchQuery}
      activeSort={activeSort}
    />
  );
}

async function NewsArticleSections({
  activeCategory,
  activeTag,
  searchQuery,
  activeSort,
  currentPage,
}: NewsQueryState) {
  const offset = (currentPage - 1) * NEWS_PAGE_SIZE;
  const isFirstPage = currentPage === 1;
  const hasFilters = Boolean(activeCategory || activeTag || searchQuery || activeSort !== "latest");
  const filterOpts = {
    category: activeCategory ?? undefined,
    tag: activeTag ?? undefined,
    search: searchQuery ?? undefined,
    sort: activeSort,
  };

  const [articles, featuredArticles, totalCount] = await Promise.all([
    fetchPublishedArticles({ ...filterOpts, limit: NEWS_PAGE_SIZE, offset }),
    isFirstPage && !hasFilters ? fetchFeaturedArticles(8) : Promise.resolve([]),
    countPublishedArticles(filterOpts),
  ]);

  const featuredIds = new Set(featuredArticles.map((article) => article.id));
  const recentArticles = articles.filter(
    (article) => !featuredIds.has(article.id),
  );
  const hasNextPage = offset + articles.length < totalCount;
  const resultLabel = searchQuery
    ? "Search results"
    : activeCategory || activeTag
      ? "Filtered articles"
      : activeSort === "popular"
        ? "Popular articles"
        : activeSort === "newest"
          ? "Newest articles"
          : "Latest articles";
  const paginationSearchParams: Record<string, string | null> = {
    category: activeCategory,
    tag: activeTag,
    q: searchQuery,
    sort: activeSort === "latest" ? null : activeSort,
  };

  return (
    <div className="space-y-14 md:space-y-16">
      {isFirstPage && featuredArticles.length > 0 && !hasFilters && (
        <section aria-labelledby="featured-heading" className="content-deferred">
          <h2
            id="featured-heading"
            className="mb-6 flex items-center gap-3 font-heading text-[10px] font-semibold uppercase tracking-[0.25em] text-text-secondary sm:text-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
            Featured Articles
          </h2>
          <div className="scrollbar-none -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto scroll-smooth px-6 pb-2 sm:-mx-8 sm:px-8 xl:-mx-10 xl:px-10">
            {featuredArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                featured
                priority={index === 0}
              />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="articles-heading">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2
            id="articles-heading"
            className="flex items-center gap-3 font-heading text-[10px] font-semibold uppercase tracking-[0.25em] text-text-secondary sm:text-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary" />
            {resultLabel}
          </h2>
          <span className="font-data text-xs text-text-tertiary">
            {totalCount} {totalCount === 1 ? "article" : "articles"}
          </span>
        </div>

        {recentArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {recentArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                priority={isFirstPage && !featuredArticles.length && index < 2}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-bg-surface/40 px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-white/5 text-text-tertiary">
              <FileText size={20} aria-hidden="true" />
            </div>
            <h3 className="font-display text-xl font-semibold text-text-primary">
              No articles found
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
              {hasFilters
                ? "Try a broader search or clear one of the active filters."
                : "New editorial coverage will appear here as soon as it is published."}
            </p>
          </div>
        )}

        <NewsPagination
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          basePath="/news"
          searchParams={paginationSearchParams}
        />
      </section>
    </div>
  );
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const activeCategory = params.category ?? null;
  const activeTag = params.tag ?? null;
  const searchQuery = params.q?.trim() || null;
  const activeSort = normalizeArticleSort(params.sort);
  const currentPage = parseCurrentPage(params.page);
  const queryState: NewsQueryState = {
    activeCategory,
    activeTag,
    searchQuery,
    activeSort,
    currentPage,
  };
  const hasFilters = Boolean(activeCategory || activeTag || searchQuery || activeSort !== "latest");
  const resultsKey = `${activeCategory ?? "all"}-${activeTag ?? "all"}-${searchQuery ?? "none"}-${activeSort}-${currentPage}`;

  return (
    <div className="relative min-h-screen overflow-x-hidden -mt-14 md:-mt-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] overflow-hidden">
        <div className="absolute left-[-28%] top-[-10%] h-[520px] w-[520px] rounded-full bg-accent-primary/10 blur-[120px] md:left-[5%]" />
        <div className="absolute right-[-30%] top-[16%] h-[460px] w-[460px] rounded-full bg-accent-secondary/10 blur-[110px] md:right-[6%]" />
      </div>

      <div className="container-content pt-12 pb-24 md:pt-20">
        <section aria-label="News introduction" className="mb-12 md:mb-16">
          <Breadcrumb
            className="mb-10 md:mb-5"
            items={[{ label: "Home", href: "/" }, { label: "News" }]}
          />

          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <PageHeading className="mb-6">News</PageHeading>
            <p className="max-w-lg text-balance font-body text-base leading-relaxed text-text-secondary md:text-lg">
              Industry updates, release notes, recommendations, and editorial
              commentary on manga, manhwa, and manhua.
            </p>
            <div className="mt-10 h-px w-12 bg-text-primary/20" />
          </div>
        </section>

        <main>
          <section aria-label="Article discovery" className="mb-12">
            <Suspense fallback={<NewsFiltersSkeleton />}>
              <NewsFilterSection {...queryState} />
            </Suspense>
          </section>

          <Suspense
            key={resultsKey}
            fallback={<NewsResultsSkeleton showFeatured={currentPage === 1 && !hasFilters} />}
          >
            <NewsArticleSections {...queryState} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
