'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PaginationControlsProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, pageCount, onPageChange }: PaginationControlsProps) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2 pt-3">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className={cn(
          'inline-flex h-8 items-center gap-1 rounded-md border border-white/10 px-2.5 font-body text-xs transition-colors',
          page === 0 ? 'cursor-not-allowed text-text-tertiary opacity-50' : 'text-text-secondary hover:text-text-primary',
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Previous
      </button>
      <span className="font-data text-xs text-text-tertiary">
        {page + 1} / {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
        disabled={page >= pageCount - 1}
        className={cn(
          'inline-flex h-8 items-center gap-1 rounded-md border border-white/10 px-2.5 font-body text-xs transition-colors',
          page >= pageCount - 1 ? 'cursor-not-allowed text-text-tertiary opacity-50' : 'text-text-secondary hover:text-text-primary',
        )}
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
