'use client';

// ============================================================
// ArticleCard — news/editorial article card with blur-up image
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
//                  docs/motion/ANIMATION_GUIDELINES.md — Rule 7, 9
// ============================================================

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { ArticleSummary } from '@/types/article';

interface ArticleCardProps {
  article: ArticleSummary;
  /** Render as a larger featured card with prominent imagery */
  featured?: boolean;
  /** Use eager loading for above-fold images (e.g., featured cards at top of page) */
  priority?: boolean;
}

/**
 * Format a date string into a readable publication date.
 */
function formatPublishDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ArticleCard({ article, featured = false, priority = false }: ArticleCardProps) {
  const prefersReduced = usePrefersReducedMotion();

  const hoverAnimation = prefersReduced
    ? {}
    : {
        whileHover: {
          scale: 1.02,
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.15), 0 4px 12px rgba(0, 0, 0, 0.3)',
        },
        transition: {
          type: 'spring' as const,
          stiffness: 300,
          damping: 20,
        },
      };

  return (
    <motion.article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg',
        'bg-bg-surface border border-white/5',
        'shadow-md',
        featured ? 'md:flex-row md:col-span-2' : '',
      )}
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}
      {...hoverAnimation}
    >
      <Link
        href={`/news/${article.slug}`}
        className="flex flex-col flex-1 focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 rounded-lg"
        aria-label={`Read article: ${article.title}`}
      >
        {/* Featured image */}
        <div
          className={cn(
            'relative overflow-hidden',
            featured
              ? 'md:w-1/2 md:min-h-full aspect-[16/9] md:aspect-auto'
              : 'aspect-[16/9]',
          )}
          style={{
            backgroundColor: article.featuredImage?.dominantColor ?? '#1a1a2e',
          }}
        >
          {/* Blur placeholder */}
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

          {/* Full image */}
          {article.featuredImage?.url && (
            <img
              src={article.featuredImage.url}
              alt=""
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : undefined}
              decoding={priority ? 'sync' : 'async'}
              className={cn(
                'absolute inset-0 w-full h-full object-cover',
                'transition-transform duration-500',
                !prefersReduced && 'group-hover:scale-105',
              )}
            />
          )}

          {/* Gradient overlay for text readability on featured */}
          {featured && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent to-bg-surface/60 hidden md:block"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Content */}
        <div
          className={cn(
            'flex flex-col flex-1 p-4 gap-3',
            featured ? 'md:p-6 md:justify-center' : '',
          )}
        >
          {/* Category badge + meta */}
          <div className="flex items-center gap-2 flex-wrap">
            {article.category && (
              <span
                className="inline-block px-2 py-0.5 rounded-sm text-xs font-heading uppercase tracking-wider"
                style={{
                  color: article.category.color,
                  backgroundColor: `${article.category.color}15`,
                  border: `1px solid ${article.category.color}30`,
                }}
              >
                {article.category.name}
              </span>
            )}
            <span className="text-text-tertiary text-xs font-data">
              {formatPublishDate(article.publishDate)}
            </span>
            <span className="text-text-tertiary/40 text-xs">·</span>
            <span className="text-text-tertiary text-xs font-data">
              {article.readingTimeMinutes} min read
            </span>
          </div>

          {/* Title */}
          <h3
            className={cn(
              'font-display font-semibold text-text-primary leading-snug',
              featured ? 'text-xl md:text-2xl' : 'text-base',
              'line-clamp-2',
            )}
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p
              className={cn(
                'text-text-secondary leading-relaxed',
                featured ? 'text-sm md:text-base line-clamp-3' : 'text-sm line-clamp-2',
              )}
            >
              {article.excerpt}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
