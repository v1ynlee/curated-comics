// ============================================================
// Creator Detail Loading State
// ============================================================

import { TitleCardSkeleton } from '@/components/ui/Skeleton';

export default function CreatorDetailLoading() {
  return (
    <main className="container-content pt-24 md:pt-28 pb-24">
      <div className="flex flex-col gap-10">
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="aspect-square animate-shimmer rounded-lg bg-surface-elevated" />
          <div className="flex flex-col justify-center gap-4">
            <div className="h-10 w-64 animate-shimmer rounded-sm bg-surface-elevated" />
            <div className="h-4 w-36 animate-shimmer rounded-sm bg-surface-elevated" />
            <div className="h-4 w-full max-w-xl animate-shimmer rounded-sm bg-surface-elevated" />
            <div className="h-4 w-4/5 max-w-lg animate-shimmer rounded-sm bg-surface-elevated" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <TitleCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
