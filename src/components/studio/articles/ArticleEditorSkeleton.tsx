import { Skeleton } from '@/components/ui/Skeleton';

export function ArticleEditorSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-5">
        <div className="rounded-lg border border-white/10 bg-bg-surface/35 p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-[18rem_minmax(0,1fr)]">
            <Skeleton className="aspect-[16/10] rounded-md" />
            <div className="max-w-2xl space-y-4">
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          </div>
        </div>
        <Skeleton className="h-[40rem] rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <aside className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-lg" />
        ))}
      </aside>
    </div>
  );
}
