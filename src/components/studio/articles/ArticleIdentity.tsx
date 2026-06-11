import Image from 'next/image';
import Link from 'next/link';
import { Pin } from 'lucide-react';
import type { StudioArticleRow } from '@/types/studio';

interface ArticleIdentityProps {
  article: StudioArticleRow;
}

export function ArticleIdentity({ article }: ArticleIdentityProps) {
  return (
    <div className="flex min-w-0 gap-3">
      <div
        className="relative mt-0.5 h-12 w-16 shrink-0 overflow-hidden rounded-md bg-bg-mid sm:h-14 sm:w-20"
        style={{ backgroundColor: article.featuredImageColor ?? undefined }}
      >
        {article.featuredImageUrl && (
          <Image
            src={article.featuredImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 64px, 80px"
            className="object-cover"
            unoptimized
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={`/studio/articles/${article.slug}`}
            className="min-w-0 truncate font-medium text-text-primary transition-colors duration-150 hover:text-accent-primary"
          >
            {article.title}
          </Link>
          {article.featured && <Pin size={13} className="shrink-0 text-accent-secondary" aria-label="Featured article" />}
        </div>
        {article.excerpt && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">
            {article.excerpt}
          </p>
        )}
        {article.tagNames.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-text-tertiary">
            {article.tagNames.slice(0, 3).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
