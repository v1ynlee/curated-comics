// ============================================================
// Article Detail Page — /news/[slug]
// Server component with SEO metadata, featured image blur-up,
// editorial typography, and lazy-loaded body images.
// Source of truth: .kiro/specs/platform-evolution-planning/requirements.md
//                  Requirements 11.3, 11.4, 16.2, 16.3, 16.4
// ============================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchArticleBySlug } from '@/services/articles';
import { MarkdownRenderer } from '@/components/news/MarkdownRenderer';
import { SITE_URL } from '@/lib/constants';
import type { Article } from '@/types/article';
import type { MediaVariant } from '@/types/media';

interface Props {
  params: Promise<{ slug: string }>;
}

// ── SEO Metadata (Req 15.1, 15.2, 15.3) ─────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  // Fallback: seo_title → article title, seo_description → excerpt
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
      tags: article.tags.map((t) => t.name),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// ── Helper: build JSON-LD structured data (Req 15.5) ─────────

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

// ── Helper: format date ──────────────────────────────────────

function formatPublishDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Helper: build srcSet from variants ───────────────────────

function buildFeaturedSrcSet(variants: MediaVariant[]): {
  avifSrcSet: string;
  webpSrcSet: string;
  fallbackSrc: string;
} {
  const avifVariants = variants
    .filter((v) => v.format === 'avif')
    .sort((a, b) => a.width - b.width);
  const webpVariants = variants
    .filter((v) => v.format === 'webp')
    .sort((a, b) => a.width - b.width);

  const avifSrcSet = avifVariants.map((v) => `${v.url} ${v.width}w`).join(', ');
  const webpSrcSet = webpVariants.map((v) => `${v.url} ${v.width}w`).join(', ');

  // Fallback: largest WebP variant
  const fallbackSrc = webpVariants[webpVariants.length - 1]?.url ?? '';

  return { avifSrcSet, webpSrcSet, fallbackSrc };
}

// ── Helper: get OG image URL ─────────────────────────────────

function getOgImageUrl(article: Article): string | null {
  if (!article.featuredImage?.variants?.length) return null;

  const webpVariants = article.featuredImage.variants
    .filter((v: MediaVariant) => v.format === 'webp')
    .sort((a: MediaVariant, b: MediaVariant) => b.width - a.width);

  return webpVariants[0]?.url ?? article.featuredImage.variants[0]?.url ?? null;
}

// ── Page Component ───────────────────────────────────────────

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) notFound();

  const featuredImage = article.featuredImage;
  const hasFeaturedImage = !!featuredImage && featuredImage.variants.length > 0;

  let featuredSrcSets: ReturnType<typeof buildFeaturedSrcSet> | null = null;
  if (hasFeaturedImage) {
    featuredSrcSets = buildFeaturedSrcSet(featuredImage.variants);
  }

  const jsonLd = buildArticleJsonLd(article);

  return (
    <div className="min-h-screen bg-bg-deep">
      {/* JSON-LD Structured Data (Req 15.5) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Featured Image — full content width with blur-up and dominant color (Req 16.2, 16.4) */}
      {hasFeaturedImage && featuredSrcSets && (
        <section
          className="relative w-full overflow-hidden"
          style={{
            backgroundColor: featuredImage.dominantColor || '#1a1a2e',
            aspectRatio: `${featuredImage.originalWidth} / ${featuredImage.originalHeight}`,
            maxHeight: '560px',
          }}
          aria-label="Featured article image"
        >
          {/* Blur placeholder background */}
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

          {/* Responsive featured image with srcset */}
          <picture>
            {featuredSrcSets.avifSrcSet && (
              <source
                type="image/avif"
                srcSet={featuredSrcSets.avifSrcSet}
                sizes="100vw"
              />
            )}
            {featuredSrcSets.webpSrcSet && (
              <source
                type="image/webp"
                srcSet={featuredSrcSets.webpSrcSet}
                sizes="100vw"
              />
            )}
            <img
              src={featuredSrcSets.fallbackSrc}
              alt={article.title}
              className="relative w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </picture>

          {/* Bottom gradient for text readability */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg-deep to-transparent"
            aria-hidden="true"
          />
        </section>
      )}

      {/* Article Content */}
      <article className="container-content py-12 md:py-16">
        {/* Header — editorial typography (Req 11.4) */}
        <header className="max-w-prose mx-auto mb-12">
          {/* Category badge */}
          {article.category && (
            <div className="mb-4">
              <span
                className="inline-block px-3 py-1 rounded-sm text-xs font-heading uppercase tracking-wider"
                style={{
                  color: article.category.color ?? '#8b5cf6',
                  backgroundColor: `${article.category.color ?? '#8b5cf6'}15`,
                  border: `1px solid ${article.category.color ?? '#8b5cf6'}30`,
                }}
              >
                {article.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight tracking-tight mb-4">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-text-secondary text-lg md:text-xl leading-relaxed mb-6">
              {article.subtitle}
            </p>
          )}

          {/* Meta: publication date, reading time */}
          <div className="flex items-center gap-3 text-text-tertiary text-sm font-data flex-wrap">
            {article.publishDate && (
              <time dateTime={article.publishDate}>
                {formatPublishDate(article.publishDate)}
              </time>
            )}
            <span className="text-text-tertiary/40">·</span>
            <span>{article.readingTimeMinutes} min read</span>
          </div>
        </header>

        {/* Body — editorial typography with MarkdownRenderer (Req 11.3, 11.4) */}
        <div className="max-w-prose mx-auto">
          <MarkdownRenderer content={article.body} />
        </div>

        {/* Tags (Req 11.3) */}
        {article.tags.length > 0 && (
          <footer className="max-w-prose mx-auto mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-text-tertiary text-sm font-data mr-1">Tags:</span>
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-block px-2.5 py-1 rounded-sm text-xs font-data text-text-secondary bg-surface-elevated/30 border border-white/5 hover:border-white/10 transition-colors"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </footer>
        )}
      </article>
    </div>
  );
}
