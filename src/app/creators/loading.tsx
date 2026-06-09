// ============================================================
// Creators Page Loading State
// ============================================================

import { CreatorCardSkeleton } from '@/components/creators/CreatorCard';

export default function CreatorsLoading() {
  return (
    <div className="container-content pt-20 pb-24">
      <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center gap-4 text-center">
        <div className="h-12 w-56 animate-shimmer rounded-sm bg-surface-elevated" />
        <div className="h-4 w-full max-w-md animate-shimmer rounded-sm bg-surface-elevated" />
        <div className="h-px w-12 bg-text-primary/20" />
      </div>
      <div className="mb-6 h-20 animate-shimmer rounded-lg bg-surface-elevated" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <CreatorCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
