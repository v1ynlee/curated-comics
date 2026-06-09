'use client';

import { cn } from '@/lib/utils/cn';
import type { StudioArticleRow } from '@/types/studio';
import { STATE_STYLES } from './article-dashboard-constants';
import { formatState } from './article-dashboard-utils';

interface ArticleStateButtonProps {
  article: StudioArticleRow;
  pending: boolean;
  onClick: () => void;
}

export function ArticleStateButton({ article, pending, onClick }: ArticleStateButtonProps) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className={cn(
        'rounded-md border px-2 py-1 text-xs transition-colors duration-150 disabled:opacity-50',
        STATE_STYLES[article.publicationState],
      )}
    >
      {formatState(article.publicationState)}
    </button>
  );
}
