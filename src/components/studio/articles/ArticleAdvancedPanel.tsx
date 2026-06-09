'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { StudioField } from '@/components/studio/shared/StudioField';

interface ArticleAdvancedPanelProps {
  title: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  wordCount: number;
  readingTimeMinutes: number;
  tagCount: number;
  onSeoTitleChange: (value: string | undefined) => void;
  onSeoDescriptionChange: (value: string | undefined) => void;
}

export function ArticleAdvancedPanel({
  title,
  excerpt,
  seoTitle,
  seoDescription,
  wordCount,
  readingTimeMinutes,
  tagCount,
  onSeoTitleChange,
  onSeoDescriptionChange,
}: ArticleAdvancedPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-text-tertiary">
        <span><strong className="block font-data text-sm text-text-primary">{wordCount.toLocaleString()}</strong>Words</span>
        <span><strong className="block font-data text-sm text-text-primary">{readingTimeMinutes}</strong>Min</span>
        <span><strong className="block font-data text-sm text-text-primary">{tagCount}</strong>Tags</span>
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 rounded-sm text-left text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
        >
          Advanced Options
          <ChevronDown size={15} className={cn('shrink-0 text-text-tertiary transition-transform duration-150', open && 'rotate-180')} aria-hidden="true" />
        </button>

        <div className="studio-accordion-panel" data-state={open ? 'open' : 'closed'}>
          <div className="studio-accordion-panel-inner space-y-4">
            <StudioField label="SEO title" htmlFor="article-seo-title">
              <input
                id="article-seo-title"
                type="text"
                value={seoTitle ?? ''}
                onChange={(event) => onSeoTitleChange(event.target.value || undefined)}
                placeholder={title || 'Defaults to article title'}
                className="studio-input"
                tabIndex={open ? 0 : -1}
              />
            </StudioField>

            <StudioField label="SEO description" htmlFor="article-seo-description" hint={`${(seoDescription ?? '').length}/160`}>
              <textarea
                id="article-seo-description"
                value={seoDescription ?? ''}
                onChange={(event) => onSeoDescriptionChange(event.target.value.slice(0, 160) || undefined)}
                placeholder={excerpt || 'Generated from article body'}
                rows={2}
                maxLength={160}
                className="studio-input resize-none"
                tabIndex={open ? 0 : -1}
              />
            </StudioField>
          </div>
        </div>
      </div>
    </section>
  );
}
