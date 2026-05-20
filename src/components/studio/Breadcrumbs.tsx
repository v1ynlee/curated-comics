// ============================================================
// Breadcrumbs — Navigation context for nested Studio routes.
// Shows the path: Studio > Section > Current Page
// Last item is non-linked (current page).
// ============================================================

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 flex-wrap" role="list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight
                  size={12}
                  className="text-text-tertiary/50 shrink-0"
                  aria-hidden="true"
                />
              )}
              {isLast || !item.href ? (
                <span
                  className="font-body text-xs text-text-tertiary truncate max-w-[200px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'font-body text-xs text-text-tertiary',
                    'hover:text-text-secondary transition-colors duration-150',
                    'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 rounded-sm',
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
