'use client';

import { cn } from '@/lib/utils/cn';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarPlus, Pin, RefreshCw } from 'lucide-react';
import type { StudioArticleRow } from '@/types/studio';
import { SelectionBox } from '@/components/studio/shared/SelectionBox';
import { ArticleRowActionsMenu } from './ArticleRowActionsMenu';
import type { ArticleActionHandlers } from './article-dashboard-types';
import { STATE_STYLES } from './article-dashboard-constants';
import { articleCategoryTone, formatDateTime, formatState } from './article-dashboard-utils';

interface ArticleCardListProps extends ArticleActionHandlers {
  articles: StudioArticleRow[];
  selectedIds: string[];
  pendingKey: string | null;
  onToggleSelection: (id: string) => void;
}

export function ArticleCardList({
  articles,
  selectedIds,
  pendingKey,
  onToggleSelection,
  onToggleFeatured,
  onArchive,
  onDelete,
}: ArticleCardListProps) {
  return (
    <div className="grid w-full min-w-0 gap-3 overflow-x-clip xl:hidden">
      {articles.map((article) => (
        <article key={article.id} className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-white/10 bg-bg-surface/40">
          <div className="grid min-w-0 grid-cols-[4.25rem_minmax(0,1fr)_1.75rem] gap-3 p-3 sm:grid-cols-[5rem_minmax(0,1fr)_2rem] sm:p-4">
            <div
              className="relative h-16 w-full overflow-hidden rounded-md bg-bg-mid sm:h-20"
              style={{ backgroundColor: article.featuredImageColor ?? undefined }}
            >
              {article.featuredImageUrl && (
                <Image
                  src={article.featuredImageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 68px, 80px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <Link href={`/studio/articles/${article.slug}`} className="min-w-0 truncate font-body text-sm font-medium text-text-primary hover:text-accent-primary">
                  {article.title}
                </Link>
                {article.featured && <Pin size={12} className="shrink-0 text-accent-secondary" aria-label="Featured article" />}
              </div>
              {article.excerpt && (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">
                  {article.excerpt}
                </p>
              )}
              {article.tagNames.length > 0 && (
                <div className="mt-2 flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-[11px] text-text-tertiary">
                  {article.tagNames.slice(0, 3).map((tag) => (
                    <span key={tag} className="max-w-full truncate">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <ArticleRowActionsMenu
              article={article}
              pendingKey={pendingKey}
              onToggleFeatured={() => onToggleFeatured(article)}
              onArchive={() => onArchive(article)}
              onDelete={() => onDelete(article)}
            />
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 border-t border-white/10 px-3 py-2 text-xs text-text-tertiary sm:px-4">
            <SelectionBox checked={selectedIds.includes(article.id)} label={`Select ${article.title}`} onChange={() => onToggleSelection(article.id)} />
            <span className={cn('rounded-md border px-2 py-1', STATE_STYLES[article.publicationState])}>
              {formatState(article.publicationState)}
            </span>
            <span className={cn('min-w-0 max-w-full truncate rounded-md border px-2 py-1', articleCategoryTone(article.categoryName, article.categorySlug))}>
              {article.categoryName ?? 'Unassigned'}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1 text-text-tertiary" title={`Created ${formatDateTime(article.createdAt)}`}>
              <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="truncate font-data">{formatDateTime(article.createdAt)}</span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1 text-text-tertiary" title={`Updated ${formatDateTime(article.updatedAt)}`}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="truncate font-data">{formatDateTime(article.updatedAt)}</span>
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
