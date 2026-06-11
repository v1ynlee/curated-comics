'use client';

import type { StudioArticleRow } from '@/types/studio';
import { SelectionBox } from '@/components/studio/shared/SelectionBox';
import { ArticleIdentity } from './ArticleIdentity';
import { ArticleRowActionsMenu } from './ArticleRowActionsMenu';
import { ArticleStateButton } from './ArticleStateButton';
import type { ArticleActionHandlers } from './article-dashboard-types';
import { WORKFLOW_STATE_STYLES } from './article-dashboard-constants';
import { articleCategoryTone, formatDateTime, formatWorkflowState } from './article-dashboard-utils';
import { cn } from '@/lib/utils/cn';

interface ArticleTableProps extends ArticleActionHandlers {
  articles: StudioArticleRow[];
  selectedIds: string[];
  allVisibleSelected: boolean;
  pendingKey: string | null;
  onToggleSelection: (id: string) => void;
  onToggleVisibleSelection: () => void;
}

export function ArticleTable({
  articles,
  selectedIds,
  allVisibleSelected,
  pendingKey,
  onToggleSelection,
  onToggleVisibleSelection,
  onToggleState,
  onToggleFeatured,
  onArchive,
  onDelete,
}: ArticleTableProps) {
  return (
    <div className="hidden overflow-visible rounded-lg border border-white/10 bg-bg-surface/40 xl:block">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="border-b border-white/10 text-xs text-text-tertiary">
          <tr>
            <th className="w-12 px-4 py-3">
              <SelectionBox checked={allVisibleSelected} label="Select all visible articles" onChange={onToggleVisibleSelection} />
            </th>
            <th className="px-4 py-3 font-medium">Article</th>
            <th className="w-32 px-4 py-3 font-medium">Publication</th>
            <th className="w-40 px-4 py-3 font-medium">Workflow</th>
            <th className="w-36 px-4 py-3 font-medium">Category</th>
            <th className="w-40 px-4 py-3 font-medium">Created</th>
            <th className="w-40 px-4 py-3 font-medium">Updated</th>
            <th className="w-32 px-4 py-3 font-medium">Stats</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {articles.map((article) => (
            <tr key={article.id} className="transition-colors duration-150 hover:bg-white/[0.03]">
              <td className="px-4 py-4 align-top">
                <SelectionBox checked={selectedIds.includes(article.id)} label={`Select ${article.title}`} onChange={() => onToggleSelection(article.id)} />
              </td>
              <td className="px-4 py-4 align-top">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <ArticleIdentity article={article} />
                  <ArticleRowActionsMenu
                    article={article}
                    pendingKey={pendingKey}
                    onToggleFeatured={() => onToggleFeatured(article)}
                    onArchive={() => onArchive(article)}
                    onDelete={() => onDelete(article)}
                  />
                </div>
              </td>
              <td className="px-4 py-4 align-top">
                <ArticleStateButton article={article} pending={pendingKey === `state-${article.id}`} onClick={() => onToggleState(article)} />
              </td>
              <td className="px-4 py-4 align-top">
                <span className={cn('inline-flex rounded-md border px-2 py-1 text-xs', WORKFLOW_STATE_STYLES[article.editorialState])}>
                  {formatWorkflowState(article.editorialState)}
                </span>
              </td>
              <td className="px-4 py-4 align-top text-xs text-text-secondary">
                <span className={cn('inline-flex max-w-full rounded-md border px-2 py-1', articleCategoryTone(article.categoryName, article.categorySlug))}>
                  <span className="truncate">{article.categoryName ?? 'Unassigned'}</span>
                </span>
              </td>
              <td className="px-4 py-4 align-top font-data text-xs text-text-tertiary">
                {formatDateTime(article.createdAt)}
              </td>
              <td className="px-4 py-4 align-top font-data text-xs text-text-tertiary">
                {formatDateTime(article.updatedAt)}
              </td>
              <td className="px-4 py-4 align-top font-data text-xs text-text-tertiary">
                {article.wordCount.toLocaleString()} words<br />{article.readingTimeMinutes} min
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
