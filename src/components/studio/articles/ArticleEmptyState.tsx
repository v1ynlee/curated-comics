import { FileText } from 'lucide-react';

interface ArticleEmptyStateProps {
  filtered: boolean;
}

export function ArticleEmptyState({ filtered }: ArticleEmptyStateProps) {
  if (filtered) {
    return (
      <div className="rounded-lg border border-white/10 bg-bg-surface/40 px-6 py-14 text-center">
        <p className="text-sm text-text-secondary">No articles match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-bg-surface/40 px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-white/5 text-text-tertiary">
        <FileText size={20} aria-hidden="true" />
      </div>
      <p className="text-sm text-text-secondary">No articles yet. Start with a draft and publish when it is ready.</p>
    </div>
  );
}
