import { Skeleton } from '@/components/ui/Skeleton';

export default function ArticleLoading() {
  return (
    <div className="min-h-screen overflow-x-hidden -mt-14 md:-mt-16">
      <article className="container-content pt-12 pb-24 md:pt-20">
        <Skeleton className="mx-auto mb-10 h-4 w-56 md:mb-8" />

        <header className="mx-auto max-w-4xl text-center">
          <Skeleton className="mx-auto h-4 w-28" />
          <Skeleton className="mx-auto mt-3 h-3 w-80 max-w-full" />
          <Skeleton className="mx-auto mt-7 h-20 w-full max-w-3xl md:h-28" />
          <Skeleton className="mx-auto mt-5 h-5 w-full max-w-xl" />
          <Skeleton className="mx-auto mt-3 h-5 w-2/3 max-w-md" />
        </header>

        <Skeleton className="mx-auto mt-10 aspect-[16/9] max-h-[560px] w-full max-w-5xl rounded-lg md:mt-12" />

        <div className="mx-auto mt-12 max-w-[740px] space-y-5 md:mt-14">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-5 w-10/12" />
          <Skeleton className="my-8 aspect-[16/9] w-full rounded-lg" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-9/12" />
        </div>
      </article>
    </div>
  );
}
