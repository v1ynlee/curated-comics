import { ArticleEditorSkeleton } from '@/components/studio/articles/ArticleEditorSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudioArticleEditLoading() {
  return (
    <div className="container-content max-w-7xl py-8 md:py-10">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <ArticleEditorSkeleton />
    </div>
  );
}
