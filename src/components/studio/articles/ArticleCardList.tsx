'use client';

import { cn } from '@/lib/utils/cn';
import type { StudioArticleRow } from '@/types/studio';
import { SelectionBox } from '@/components/studio/shared/SelectionBox';
import { ArticleIdentity } from './ArticleIdentity';
import { ArticleRowActionsMenu } from './ArticleRowActionsMenu';
import type { ArticleActionHandlers } from './article-dashboard-types';
import { STATE_STYLES } from './article-dashboard-constants';
import { formatDateTime, formatState } from './article-dashboard-utils';

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
    <div className="grid gap-3 xl:hidden">
      {articles.map((article) => (
        <article key={article.id} className="rounded-lg border border-white/10 bg-bg-surface/40 p-4">
          <div className="mb-3 flex items-start gap-3">
            <SelectionBox checked={selectedIds.includes(article.id)} label={`Select ${article.title}`} onChange={() => onToggleSelection(article.id)} />
            <div className="min-w-0 flex-1">
              <ArticleIdentity article={article} />
            </div>
            <ArticleRowActionsMenu
              article={article}
              pendingKey={pendingKey}
              onToggleFeatured={() => onToggleFeatured(article)}
              onArchive={() => onArchive(article)}
              onDelete={() => onDelete(article)}
            />
          </div>
          <div className="grid gap-2 text-xs text-text-tertiary sm:grid-cols-2">
            <span className={cn('w-fit rounded-md border px-2 py-1', STATE_STYLES[article.publicationState])}>
              {formatState(article.publicationState)}
            </span>
            <span>{article.categoryName ?? 'Unassigned'}</span>
            <span>Created {formatDateTime(article.createdAt)}</span>
            <span>Updated {formatDateTime(article.updatedAt)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
