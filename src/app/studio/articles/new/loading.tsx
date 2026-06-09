import { Breadcrumbs } from '@/components/studio/Breadcrumbs';
import { ArticleEditorSkeleton } from '@/components/studio/articles/ArticleEditorSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudioArticleNewLoading() {
  return (
    <div className="container-content max-w-7xl py-8 md:py-10">
      <Breadcrumbs
        items={[
          { label: 'Studio', href: '/studio' },
          { label: 'Articles', href: '/studio/articles' },
          { label: 'New Article' },
        ]}
      />
      <div className="mb-8 space-y-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <ArticleEditorSkeleton />
    </div>
  );
}
