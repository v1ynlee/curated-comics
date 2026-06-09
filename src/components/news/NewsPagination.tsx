'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NewsPaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  basePath: string;
  searchParams?: Record<string, string | null>;
}

function buildPageUrl(
  basePath: string,
  page: number,
  extra: Record<string, string | null>,
): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  Object.entries(extra).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function NewsPagination({
  currentPage,
  hasNextPage,
  basePath,
  searchParams = {},
}: NewsPaginationProps) {
  const hasPrev = currentPage > 1;

  if (!hasPrev && !hasNextPage) return null;

  const prevUrl = buildPageUrl(basePath, currentPage - 1, searchParams);
  const nextUrl = buildPageUrl(basePath, currentPage + 1, searchParams);

  const btnBase = cn(
    'inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5',
    'font-heading text-[11px] uppercase tracking-[0.12em]',
    'transition-colors duration-150 hover:bg-white/5',
    'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
  );

  const activeBtn = cn(
    btnBase,
    'text-text-secondary hover:text-text-primary',
  );

  const disabledBtn = cn(
    btnBase,
    'text-text-tertiary/35 cursor-not-allowed pointer-events-none',
  );

  return (
    <nav
      aria-label="Article pagination"
      className="mt-12 flex justify-center"
    >
      <div className="inline-flex items-center gap-2">
        {hasPrev ? (
          <Link href={prevUrl} className={activeBtn} aria-label="Previous page">
            <ChevronLeft size={14} />
            Previous
          </Link>
        ) : (
          <span className={disabledBtn} aria-disabled="true">
            <ChevronLeft size={14} />
            Previous
          </span>
        )}

        {hasNextPage ? (
          <Link href={nextUrl} className={activeBtn} aria-label="Next page">
            Next
            <ChevronRight size={14} />
          </Link>
        ) : (
          <span className={disabledBtn} aria-disabled="true">
            Next
            <ChevronRight size={14} />
          </span>
        )}
      </div>
    </nav>
  );
}
