import { NewsFiltersSkeleton, NewsResultsSkeleton } from '@/components/news/ArticleGridSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function NewsLoading() {
  return (
    <div className="min-h-screen overflow-x-hidden -mt-14 md:-mt-16">
      <div className="container-content pt-12 pb-24 md:pt-20">
        <section className="mb-12 md:mb-16">
          <Skeleton className="mx-auto mb-10 h-4 w-48 md:mb-5" />
          <Skeleton className="mx-auto h-20 w-64 md:h-24" />
          <Skeleton className="mx-auto mt-6 h-5 w-full max-w-lg" />
          <Skeleton className="mx-auto mt-3 h-5 w-2/3 max-w-sm" />
          <Skeleton className="mx-auto mt-10 h-px w-12" />
        </section>

        <main>
          <section className="mb-12">
            <NewsFiltersSkeleton />
          </section>
          <NewsResultsSkeleton />
        </main>
      </div>
    </div>
  );
}
