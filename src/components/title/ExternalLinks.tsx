// ============================================================
// ExternalLinks — reading source links
// Source of truth: docs/architecture/CONTENT_STRUCTURE.md
// ============================================================

import { cn } from '@/lib/cn';
import { PLATFORM_CONFIG } from '@/lib/constants';
import type { ExternalLink } from '@/types/title';

interface ExternalLinksProps {
  links: ExternalLink[];
  className?: string;
}

export function ExternalLinks({ links, className }: ExternalLinksProps) {
  if (links.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <h3 className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
        Read Online
      </h3>
      <div className="flex flex-wrap gap-2">
        {links.map((link, i) => {
          const platform = PLATFORM_CONFIG[link.platform] ?? {
            name: link.label ?? link.platform,
            color: '#6B7280',
          };

          return (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-sm',
                'font-heading text-xs font-medium uppercase tracking-widest',
                'border border-white/10 text-text-secondary',
                'hover:border-white/20 hover:text-text-primary transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              )}
              aria-label={`Read on ${platform.name} (opens in new tab)`}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: platform.color }}
                aria-hidden="true"
              />
              {link.label ?? platform.name}
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className="opacity-50"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          );
        })}
      </div>
    </div>
  );
}
