'use client';

// ============================================================
// NewsFilters — Category and tag filter controls for the news page
// Source of truth: .kiro/specs/platform-evolution-planning/requirements.md
//                  Requirements: 14.4, 14.5
// ============================================================

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import type { ArticleCategory, ArticleTag } from '@/types/article';

interface NewsFiltersProps {
  categories: ArticleCategory[];
  tags: ArticleTag[];
  activeCategory: string | null;
  activeTag: string | null;
}

export function NewsFilters({
  categories,
  tags,
  activeCategory,
  activeTag,
}: NewsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  function buildUrl(params: { category?: string | null; tag?: string | null }) {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.tag) searchParams.set('tag', params.tag);
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function handleCategoryClick(slug: string) {
    const newCategory = activeCategory === slug ? null : slug;
    router.push(buildUrl({ category: newCategory, tag: activeTag }));
  }

  function handleTagClick(slug: string) {
    const newTag = activeTag === slug ? null : slug;
    router.push(buildUrl({ category: activeCategory, tag: newTag }));
  }

  function handleClearAll() {
    router.push(pathname);
  }

  const hasActiveFilters = activeCategory || activeTag;

  return (
    <div className="flex flex-col gap-4">
      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary">
            Categories
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                aria-pressed={activeCategory === cat.slug}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-heading uppercase tracking-wider',
                  'border transition-colors duration-200',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                  activeCategory === cat.slug
                    ? 'bg-accent-primary/20 border-accent-primary/50 text-accent-primary'
                    : 'bg-bg-surface border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary',
                )}
                style={
                  activeCategory === cat.slug && cat.color
                    ? {
                        backgroundColor: `${cat.color}20`,
                        borderColor: `${cat.color}50`,
                        color: cat.color,
                      }
                    : undefined
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary">
            Tags
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.slug)}
                aria-pressed={activeTag === tag.slug}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-body',
                  'border transition-colors duration-200',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                  activeTag === tag.slug
                    ? 'bg-accent-secondary/20 border-accent-secondary/50 text-accent-secondary'
                    : 'bg-bg-surface border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary',
                )}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear all button */}
      {hasActiveFilters && (
        <button
          onClick={handleClearAll}
          className={cn(
            'self-start px-3 py-1.5 rounded-md text-xs font-body',
            'text-text-tertiary hover:text-text-primary',
            'border border-white/10 hover:border-white/20',
            'transition-colors duration-200',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          )}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
