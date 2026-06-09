// ============================================================
// Article Detail Page — /news/[slug]
// Server component with SEO metadata, featured image blur-up,
// editorial typography, and scroll-aware reading progress.
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { fetchArticleBySlug } from '@/services/public/articles';
import { ArticleReadingProgress } from '@/components/news/ArticleReadingProgress';
import { MarkdownRenderer } from '@/components/news/MarkdownRenderer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { SITE_URL } from '@/lib/utils/constants';
import type { Article } from '@/types/article';
import type { MediaVariant } from '@/types/media';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || undefined;
  const ogImageUrl = getOgImageUrl(article);

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      url: `${SITE_URL}/news/${article.slug}`,
      images: ogImageUrl ? [{ url: ogImageUrl, alt: article.title }] : undefined,
      publishedTime: article.publishDate ?? undefined,
      modifiedTime: article.updatedAt,
      tags: article.tags.map((tag) => tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

function buildArticleJsonLd(article: Article) {
  const imageUrl = getOgImageUrl(article);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.publishDate ?? article.createdAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: 'Comic Curated',
    },
    ...(imageUrl ? { image: imageUrl } : {}),
    description: article.seoDescription || article.excerpt || '',
  };
}

function formatPublishDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildFeaturedSrcSet(variants: MediaVariant[]): {
  avifSrcSet: string;
  webpSrcSet: string;
  fallbackSrc: string;
} {
  const avifVariants = variants
    .filter((variant) => variant.format === 'avif')
    .sort((a, b) => a.width - b.width);
  const webpVariants = variants
    .filter((variant) => variant.format === 'webp')
    .sort((a, b) => a.width - b.width);
  const fallbackVariant =
    webpVariants[webpVariants.length - 1] ?? avifVariants[avifVariants.length - 1] ?? variants[0];

  return {
    avifSrcSet: avifVariants.map((variant) => `${variant.url} ${variant.width}w`).join(', '),
    webpSrcSet: webpVariants.map((variant) => `${variant.url} ${variant.width}w`).join(', '),
    fallbackSrc: fallbackVariant?.url ?? '',
  };
}

function getOgImageUrl(article: Article): string | null {
  if (!article.featuredImage?.variants?.length) return null;

  const webpVariants = article.featuredImage.variants
    .filter((variant: MediaVariant) => variant.format === 'webp')
    .sort((a: MediaVariant, b: MediaVariant) => b.width - a.width);

  return webpVariants[0]?.url ?? article.featuredImage.variants[0]?.url ?? null;
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) notFound();

  const featuredImage = article.featuredImage;
  const featuredSrcSets = featuredImage?.variants.length
    ? buildFeaturedSrcSet(featuredImage.variants)
    : null;
  const jsonLd = buildArticleJsonLd(article);
  const publishedDate = article.publishDate ?? article.createdAt;

  return (
    <div className="relative min-h-screen overflow-x-hidden -mt-14 md:-mt-16">
      <ArticleReadingProgress />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[860px] overflow-hidden">
        <div className="absolute left-[-28%] top-[-10%] h-[520px] w-[520px] rounded-full bg-accent-primary/10 blur-[120px] md:left-[5%]" />
        <div className="absolute right-[-30%] top-[16%] h-[460px] w-[460px] rounded-full bg-accent-secondary/10 blur-[110px] md:right-[6%]" />
      </div>

      <article className="container-content pt-12 pb-24 md:pt-20">
        <Breadcrumb
          className="mb-10 md:mb-8"
          items={[{ label: 'Home', href: '/' }, { label: 'News', href: '/news' }, { label: 'Article' }]}
        />

        <header className="mx-auto max-w-4xl text-center">
          {article.category && (
            <div className="flex justify-center">
              <span className="border-b border-accent-primary/30 pb-1 font-heading text-xs tracking-[0.12em] text-accent-primary">
                {article.category.name}
              </span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-data text-[10px] leading-5 text-text-tertiary sm:text-[11px]">
            <time dateTime={publishedDate}>Published: {formatPublishDate(publishedDate)}</time>
            <span aria-hidden="true">/</span>
            <span>{article.readingTimeMinutes} min read</span>
            <span aria-hidden="true">/</span>
            <time dateTime={article.updatedAt}>Updated: {formatPublishDate(article.updatedAt)}</time>
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl font-display text-[clamp(2.3rem,5.8vw,4.75rem)] font-bold leading-[1.02] tracking-tight text-text-primary">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary md:text-lg md:leading-8">
              {article.subtitle}
            </p>
          )}
        </header>

        {featuredImage && featuredSrcSets && (
          <figure
            className="relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-bg-surface md:mt-12"
            style={{ backgroundColor: featuredImage.dominantColor || '#1a1a2e' }}
          >
            <div
              className="relative max-h-[560px] min-h-[220px] w-full"
              style={{ aspectRatio: `${featuredImage.originalWidth} / ${featuredImage.originalHeight}` }}
            >
              {featuredImage.blurDataUri && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 scale-110 blur-xl"
                  style={{
                    backgroundImage: `url(${featuredImage.blurDataUri})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}

              <picture>
                {featuredSrcSets.avifSrcSet && (
                  <source type="image/avif" srcSet={featuredSrcSets.avifSrcSet} sizes="(max-width: 1024px) 100vw, 960px" />
                )}
                {featuredSrcSets.webpSrcSet && (
                  <source type="image/webp" srcSet={featuredSrcSets.webpSrcSet} sizes="(max-width: 1024px) 100vw, 960px" />
                )}
                <img
                  src={featuredSrcSets.fallbackSrc}
                  alt={article.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>

              <figcaption className="absolute bottom-2 right-2 rounded-sm bg-bg-deep/60 px-2 py-1 font-data text-[9px] text-text-primary/45">
                Image: Comic Curated
              </figcaption>
            </div>
          </figure>
        )}

        <div className="mx-auto mt-12 max-w-[740px] md:mt-14">
          <MarkdownRenderer content={article.body} className="max-w-none" />

          <div className="mt-14 border-t border-white/10 pt-8">
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/news?tag=${tag.slug}`}
                    className="font-data text-xs text-text-tertiary transition-colors duration-150 hover:text-accent-primary"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/news"
              className="mt-8 inline-flex items-center gap-2 rounded-sm py-1 font-heading text-xs uppercase tracking-[0.12em] text-text-secondary transition-colors duration-150 hover:text-accent-primary"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Back to News
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
