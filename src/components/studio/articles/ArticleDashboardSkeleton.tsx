import { Skeleton } from '@/components/ui/Skeleton';

function ArticleRowSkeleton() {
  return (
    <div className="grid grid-cols-[3rem_1fr_8rem_9rem_10rem_10rem_8rem] items-center gap-4 border-b border-white/5 px-4 py-4 last:border-b-0">
      <Skeleton className="h-5 w-5 rounded-sm" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Skeleton className="h-14 w-20 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        <Skeleton className="h-6 w-3 rounded-sm" />
      </div>
      <Skeleton className="h-7 w-20 rounded-md" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ArticleDashboardSkeleton() {
  return (
    <div className="container-content max-w-7xl py-8 md:py-10">
      <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-11 w-32 rounded-md" />
      </div>
      <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-md" />
        ))}
      </div>
      <div className="mb-4 rounded-lg border border-white/10 bg-bg-surface/40 p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_repeat(5,minmax(150px,190px))]">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[42px] rounded-md" />
          ))}
        </div>
      </div>
      <div className="hidden overflow-hidden rounded-lg border border-white/10 bg-bg-surface/40 xl:block">
        {Array.from({ length: 6 }).map((_, index) => (
          <ArticleRowSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-3 xl:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
