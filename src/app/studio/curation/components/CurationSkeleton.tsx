// ============================================================
// Curation Skeletons
// ============================================================

import { Skeleton } from '@/components/ui/Skeleton';

export function CurationTabSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-56 w-full rounded-lg" />
      <Skeleton className="h-56 w-full rounded-lg" />
      <Skeleton className="h-56 w-full rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col divide-y divide-white/5 rounded-lg border border-white/10 bg-bg-surface/25" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-4 px-4 py-3">
          <Skeleton className="h-4 rounded-sm" />
          <Skeleton className="h-4 rounded-sm" />
          <Skeleton className="h-4 rounded-sm" />
          <Skeleton className="h-4 rounded-sm" />
          <Skeleton className="h-4 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
