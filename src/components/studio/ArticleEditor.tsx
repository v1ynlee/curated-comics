'use client';

// ============================================================
// ArticleEditor — Article creation/editing form for Studio CMS
// Markdown editor with toolbar, split-pane live preview,
// auto-calculated word count and reading time, and full metadata fields.
// Requirements: 13.1, 13.2, 13.3, 13.4
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/cn';
import { ImageUploader } from '@/components/studio/ImageUploader';
import type { ArticleFormData, PublicationState } from '@/types/article';

// ── Props ─────────────────────────────────────────────────────

interface ArticleEditorProps {
  mode: 'create' | 'edit';
  initialData?: ArticleFormData;
  onSave: (data: ArticleFormData) => Promise<void>;
  categories?: { id: string; name: string; slug: string; color: string | null }[];
  tags?: { id: string; name: string; slug: string }[];
}

// ── Constants ─────────────────────────────────────────────────

const PUBLICATION_STATE_OPTIONS: { value: PublicationState; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

// ── Default form state ────────────────────────────────────────

const DEFAULT_FORM_DATA: ArticleFormData = {
  title: '',
  subtitle: '',
  body: '',
  excerpt: '',
  featuredImageId: undefined,
  categoryId: undefined,
  tagIds: [],
  publicationState: 'draft',
  scheduledDate: undefined,
  seoTitle: '',
  seoDescription: '',
};

// ── Component ─────────────────────────────────────────────────

export function ArticleEditor({
  mode,
  initialData,
  onSave,
  categories = [],
  tags = [],
}: ArticleEditorProps) {
  const [formData, setFormData] = useState<ArticleFormData>(
    initialData ?? DEFAULT_FORM_DATA,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Computed values ───────────────────────────────────────────

  const wordCount = useMemo(() => {
    return formData.body
      .split(/\s+/)
      .filter((token) => token.length > 0).length;
  }, [formData.body]);

  const readingTimeMinutes = useMemo(() => {
    if (wordCount === 0) return 0;
    return Math.ceil(wordCount / 200);
  }, [wordCount]);

  // ── Handlers ──────────────────────────────────────────────────

  const updateField = useCallback(
    <K extends keyof ArticleFormData>(field: K, value: ArticleFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const toggleTag = useCallback((tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  }, []);

  const handleSubmit = useCallback(
    async (targetState?: PublicationState) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const dataToSave: ArticleFormData = {
          ...formData,
          publicationState: targetState ?? formData.publicationState,
        };
        await onSave(dataToSave);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSave],
  );

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string = '') => {
      const textarea = document.querySelector<HTMLTextAreaElement>(
        '[data-article-body]',
      );
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = formData.body.slice(start, end);
      const newText =
        formData.body.slice(0, start) +
        prefix +
        selected +
        suffix +
        formData.body.slice(end);

      updateField('body', newText);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = start + prefix.length + selected.length + suffix.length;
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [formData.body, updateField],
  );

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Error display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-body text-sm">
          {error}
        </div>
      )}

      {/* Title & Subtitle */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="article-title"
            className="font-heading text-[11px] uppercase tracking-wider text-text-secondary"
          >
            Title *
          </label>
          <input
            id="article-title"
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Article title..."
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'bg-bg-surface/60 border border-white/10',
              'text-text-primary font-body text-base',
              'placeholder:text-text-tertiary',
              'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
              'transition-colors duration-150',
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="article-subtitle"
            className="font-heading text-[11px] uppercase tracking-wider text-text-secondary"
          >
            Subtitle
          </label>
          <input
            id="article-subtitle"
            type="text"
            value={formData.subtitle ?? ''}
            onChange={(e) => updateField('subtitle', e.target.value || undefined)}
            placeholder="Optional subtitle..."
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'bg-bg-surface/60 border border-white/10',
              'text-text-primary font-body text-sm',
              'placeholder:text-text-tertiary',
              'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
              'transition-colors duration-150',
            )}
          />
        </div>
      </div>

      {/* Markdown Body Editor */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="article-body"
            className="font-heading text-[11px] uppercase tracking-wider text-text-secondary"
          >
            Body *
          </label>
          <div className="flex items-center gap-3">
            <span className="font-body text-[11px] text-text-tertiary">
              {wordCount.toLocaleString()} words · {readingTimeMinutes} min read
            </span>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={cn(
                'px-3 py-1 rounded-md font-heading text-[11px] font-bold',
                'transition-colors duration-150',
                showPreview
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10',
              )}
            >
              {showPreview ? 'Editor' : 'Preview'}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        {!showPreview && (
          <div className="flex items-center gap-1 p-2 rounded-t-lg bg-bg-surface/40 border border-white/5 border-b-0">
            <ToolbarButton label="H2" onClick={() => insertMarkdown('## ')} />
            <ToolbarButton label="H3" onClick={() => insertMarkdown('### ')} />
            <ToolbarButton label="B" onClick={() => insertMarkdown('**', '**')} />
            <ToolbarButton label="I" onClick={() => insertMarkdown('*', '*')} />
            <ToolbarButton label="Link" onClick={() => insertMarkdown('[', '](url)')} />
            <ToolbarButton label="Img" onClick={() => insertMarkdown('![alt](', ')')} />
            <ToolbarButton label="Code" onClick={() => insertMarkdown('```\n', '\n```')} />
          </div>
        )}

        {showPreview ? (
          <div
            className={cn(
              'min-h-[400px] p-6 rounded-lg',
              'bg-bg-surface/60 border border-white/10',
              'prose prose-invert prose-sm max-w-none',
              'font-body text-text-primary',
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {formData.body || '*No content yet...*'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            id="article-body"
            data-article-body=""
            value={formData.body}
            onChange={(e) => updateField('body', e.target.value)}
            placeholder="Write your article in markdown..."
            rows={20}
            className={cn(
              'w-full px-4 py-3 rounded-b-lg',
              'bg-bg-surface/60 border border-white/10',
              'text-text-primary font-mono text-sm leading-relaxed',
              'placeholder:text-text-tertiary',
              'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
              'transition-colors duration-150 resize-y min-h-[400px]',
            )}
          />
        )}
      </div>

      {/* Excerpt */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="article-excerpt"
          className="font-heading text-[11px] uppercase tracking-wider text-text-secondary"
        >
          Excerpt{' '}
          <span className="text-text-tertiary">(max 300 chars)</span>
        </label>
        <textarea
          id="article-excerpt"
          value={formData.excerpt ?? ''}
          onChange={(e) =>
            updateField('excerpt', e.target.value.slice(0, 300) || undefined)
          }
          placeholder="Brief summary for article cards..."
          rows={3}
          maxLength={300}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-bg-surface/60 border border-white/10',
            'text-text-primary font-body text-sm',
            'placeholder:text-text-tertiary',
            'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
            'transition-colors duration-150 resize-y',
          )}
        />
        <span className="font-body text-[10px] text-text-tertiary text-right">
          {(formData.excerpt ?? '').length}/300
        </span>
      </div>

      {/* Featured Image */}
      <div className="flex flex-col gap-1.5">
        <span className="font-heading text-[11px] uppercase tracking-wider text-text-secondary">
          Featured Image
        </span>
        <ImageUploader
          assetType="article-image"
          slug="article-featured"
          onUploadComplete={(asset) =>
            updateField('featuredImageId', asset?.id)
          }
        />
      </div>

      {/* Category & Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="article-category"
            className="font-heading text-[11px] uppercase tracking-wider text-text-secondary"
          >
            Category
          </label>
          <select
            id="article-category"
            value={formData.categoryId ?? ''}
            onChange={(e) =>
              updateField('categoryId', e.target.value || undefined)
            }
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'bg-bg-surface/60 border border-white/10',
              'text-text-primary font-body text-sm',
              'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
              'transition-colors duration-150',
            )}
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Publication State */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="article-state"
            className="font-heading text-[11px] uppercase tracking-wider text-text-secondary"
          >
            Publication State
          </label>
          <select
            id="article-state"
            value={formData.publicationState}
            onChange={(e) =>
              updateField('publicationState', e.target.value as PublicationState)
            }
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'bg-bg-surface/60 border border-white/10',
              'text-text-primary font-body text-sm',
              'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
              'transition-colors duration-150',
            )}
          >
            {PUBLICATION_STATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scheduled Date (shown when state is 'scheduled') */}
      {formData.publicationState === 'scheduled' && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="article-scheduled-date"
            className="font-heading text-[11px] uppercase tracking-wider text-text-secondary"
          >
            Scheduled Date
          </label>
          <input
            id="article-scheduled-date"
            type="datetime-local"
            value={formData.scheduledDate ?? ''}
            onChange={(e) =>
              updateField('scheduledDate', e.target.value || undefined)
            }
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'bg-bg-surface/60 border border-white/10',
              'text-text-primary font-body text-sm',
              'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
              'transition-colors duration-150',
            )}
          />
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <span className="font-heading text-[11px] uppercase tracking-wider text-text-secondary">
          Tags
        </span>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = formData.tagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full font-heading text-[11px] font-bold',
                  'border transition-colors duration-150',
                  isSelected
                    ? 'bg-accent-primary/20 border-accent-primary/50 text-accent-primary'
                    : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10',
                )}
              >
                {tag.name}
              </button>
            );
          })}
          {tags.length === 0 && (
            <span className="font-body text-[11px] text-text-tertiary">
              No tags available.
            </span>
          )}
        </div>
      </div>

      {/* SEO Fields */}
      <div className="flex flex-col gap-4 p-4 rounded-lg bg-bg-surface/30 border border-white/5">
        <span className="font-heading text-[11px] uppercase tracking-wider text-text-secondary">
          SEO Settings
        </span>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="article-seo-title"
            className="font-body text-[11px] text-text-tertiary"
          >
            SEO Title (defaults to article title)
          </label>
          <input
            id="article-seo-title"
            type="text"
            value={formData.seoTitle ?? ''}
            onChange={(e) => updateField('seoTitle', e.target.value || undefined)}
            placeholder={formData.title || 'SEO title...'}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg',
              'bg-bg-surface/60 border border-white/10',
              'text-text-primary font-body text-sm',
              'placeholder:text-text-tertiary',
              'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
              'transition-colors duration-150',
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="article-seo-desc"
            className="font-body text-[11px] text-text-tertiary"
          >
            SEO Description (max 160 chars, defaults to excerpt)
          </label>
          <textarea
            id="article-seo-desc"
            value={formData.seoDescription ?? ''}
            onChange={(e) =>
              updateField(
                'seoDescription',
                e.target.value.slice(0, 160) || undefined,
              )
            }
            placeholder={formData.excerpt || 'SEO description...'}
            rows={2}
            maxLength={160}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg',
              'bg-bg-surface/60 border border-white/10',
              'text-text-primary font-body text-sm',
              'placeholder:text-text-tertiary',
              'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
              'transition-colors duration-150 resize-none',
            )}
          />
          <span className="font-body text-[10px] text-text-tertiary text-right">
            {(formData.seoDescription ?? '').length}/160
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
        {/* Save as Draft */}
        <button
          type="button"
          disabled={isSubmitting || !formData.title || !formData.body}
          onClick={() => handleSubmit('draft')}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg',
            'bg-white/10 text-text-primary font-heading text-sm font-bold',
            'hover:bg-white/15 transition-colors duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          )}
        >
          Save Draft
        </button>

        {/* Publish */}
        <button
          type="button"
          disabled={isSubmitting || !formData.title || !formData.body}
          onClick={() => handleSubmit('published')}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg',
            'bg-emerald-600 text-white font-heading text-sm font-bold',
            'hover:bg-emerald-500 transition-colors duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2',
          )}
        >
          Publish
        </button>

        {/* Schedule */}
        <button
          type="button"
          disabled={
            isSubmitting ||
            !formData.title ||
            !formData.body ||
            !formData.scheduledDate
          }
          onClick={() => handleSubmit('scheduled')}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg',
            'bg-yellow-600/80 text-white font-heading text-sm font-bold',
            'hover:bg-yellow-500/80 transition-colors duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:outline-2 focus-visible:outline-yellow-400 focus-visible:outline-offset-2',
          )}
        >
          Schedule
        </button>

        {isSubmitting && (
          <span className="font-body text-sm text-text-tertiary animate-pulse">
            Saving...
          </span>
        )}
      </div>
    </div>
  );
}

// ── Toolbar Button ──────────────────────────────────────────────

function ToolbarButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded font-mono text-[11px] font-bold',
        'bg-white/5 text-text-secondary',
        'hover:bg-white/10 hover:text-text-primary',
        'transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
      )}
      aria-label={`Insert ${label}`}
    >
      {label}
    </button>
  );
}
