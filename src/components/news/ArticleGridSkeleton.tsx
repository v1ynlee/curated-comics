// ArticleGridSkeleton — shadcn-style placeholders for news loading states
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-white/10 bg-bg-surface/60',
        featured ? 'w-[min(78vw,20rem)] shrink-0 snap-start' : 'sm:grid sm:grid-cols-[9.5rem_minmax(0,1fr)]',
      )}
    >
      <Skeleton
        className={cn(
          'w-full rounded-none',
          featured ? 'aspect-[16/9]' : 'aspect-[16/9] sm:h-full sm:min-h-[8.5rem]',
        )}
      />
      <div className={cn('flex flex-col gap-3 p-4', featured ? 'min-h-[210px]' : 'sm:min-h-[8.5rem]')}>
        <div className="flex gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto flex gap-2 pt-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function NewsFiltersSkeleton() {
  return (
    <>
      <Skeleton className="h-10 w-10 rounded-md md:hidden" />
      <div className="hidden rounded-lg border border-white/10 bg-bg-surface/50 p-3 md:block">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Skeleton className="h-9 min-w-0 flex-1 rounded-md" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:w-[33rem]">
            <Skeleton className="h-9 rounded-md" />
            <Skeleton className="h-9 rounded-md" />
            <Skeleton className="h-9 rounded-md" />
          </div>
        </div>
      </div>
    </>
  );
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function FeaturedSkeleton() {
  return (
    <div className="scrollbar-none -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:-mx-8 sm:px-8 xl:-mx-10 xl:px-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} featured />
      ))}
    </div>
  );
}

export function NewsResultsSkeleton({ showFeatured = true }: { showFeatured?: boolean }) {
  return (
    <div className="space-y-14 md:space-y-16">
      {showFeatured && (
        <section>
          <Skeleton className="mb-6 h-4 w-48" />
          <FeaturedSkeleton />
        </section>
      )}
      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <ArticleGridSkeleton count={6} />
      </section>
    </div>
  );
}
