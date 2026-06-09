'use client';

// ============================================================
// ArticleCard — compact editorial article card with lazy imagery
// ============================================================

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { ArticleSummary } from '@/types/article';

interface ArticleCardProps {
  article: ArticleSummary;
  /** Featured cards are used inside the horizontal editorial rail. */
  featured?: boolean;
  /** Use eager loading for above-fold images. */
  priority?: boolean;
}

function formatPublishDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ArticleImage({ article, priority, featured }: ArticleCardProps) {
  const url = article.featuredImage?.url;
  const localMatch = url?.match(/^(\/images\/articles\/.+?)-\d+w\.webp$/);
  const baseSlug = localMatch ? localMatch[1] : null;
  const sizes = featured
    ? '(max-width: 640px) 78vw, 320px'
    : '(max-width: 640px) 100vw, 152px';
  const imgClass = 'absolute inset-0 h-full w-full object-cover transition-[filter] duration-200 group-hover:brightness-110';

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-bg-mid',
        featured ? 'aspect-[16/9] w-full' : 'aspect-[16/9] w-full sm:h-full sm:min-h-[8.5rem] sm:w-[9.5rem]',
      )}
      style={{ backgroundColor: article.featuredImage?.dominantColor ?? '#1a1a2e' }}
    >
      {article.featuredImage?.blurDataUri && (
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-110 blur-xl"
          style={{
            backgroundImage: `url(${article.featuredImage.blurDataUri})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {url && baseSlug && (
        <picture>
          <source
            type="image/webp"
            srcSet={[400, 800, 1200].map((width) => `${baseSlug}-${width}w.webp ${width}w`).join(', ')}
            sizes={sizes}
          />
          <img
            src={`${baseSlug}-800w.webp`}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'low'}
            decoding={priority ? 'sync' : 'async'}
            className={imgClass}
          />
        </picture>
      )}

      {url && !baseSlug && (
        <img
          src={url}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'low'}
          decoding={priority ? 'sync' : 'async'}
          className={imgClass}
        />
      )}
    </div>
  );
}

export function ArticleCard({ article, featured = false, priority = false }: ArticleCardProps) {
  const categoryColor = article.category?.color || 'var(--color-accent-primary)';
  const visibleTags = article.tags.slice(0, featured ? 3 : 2);

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-lg border border-white/10 bg-bg-surface/60 transition-colors duration-150',
        'hover:border-white/20 hover:bg-bg-surface/80',
        'card-contained content-deferred',
        featured ? 'w-[min(78vw,20rem)] shrink-0 snap-start' : '',
      )}
    >
      <Link
        href={`/news/${article.slug}`}
        className={cn(
          'flex h-full min-w-0 flex-col focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          !featured && 'sm:grid sm:grid-cols-[9.5rem_minmax(0,1fr)]',
        )}
        aria-label={`Read article: ${article.title}`}
      >
        <ArticleImage article={article} featured={featured} priority={priority} />

        <div className={cn('flex min-w-0 flex-1 flex-col p-4', featured ? 'min-h-[210px]' : 'sm:min-h-[8.5rem]')}>
          <div className="mb-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-none text-text-tertiary">
            {article.category && (
              <span
                className="font-heading tracking-[0.08em]"
                style={{ color: categoryColor }}
              >
                {article.category.name}
              </span>
            )}
            <time dateTime={article.publishDate} className="font-data">
              {formatPublishDate(article.publishDate)}
            </time>
            <span aria-hidden="true" className="text-text-tertiary/40">
              /
            </span>
            <span className="font-data">{article.readingTimeMinutes} min read</span>
          </div>

          <h3
            className={cn(
              'font-display font-semibold leading-snug tracking-tight text-text-primary',
              featured ? 'text-lg' : 'text-base md:text-lg',
              'line-clamp-2',
            )}
          >
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">
              {article.excerpt}
            </p>
          )}

          {visibleTags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-x-2 gap-y-1 pt-4 text-[11px] text-text-tertiary" aria-label="Article tags">
              {visibleTags.map((tag) => (
                <span key={tag.id}>#{tag.name}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
