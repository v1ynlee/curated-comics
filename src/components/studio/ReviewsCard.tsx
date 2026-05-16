'use client';

// ============================================================
// ReviewsCard — Rich text review editor with Editor/Preview tabs
// Uses Tiptap-based RichTextEditor, CardWrapper for per-card save,
// and AnimatedCheckbox for "Mark as unreviewed" warning state.
// Removes the "Quotable Lines" section entirely.
// Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
// ============================================================

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { FileText } from 'lucide-react';
import { CardWrapper } from '@/components/studio/CardWrapper';
import { AnimatedCheckbox } from '@/components/studio/AnimatedCheckbox';
import { RichTextEditor } from '@/components/studio/RichTextEditor';

// ── Props ─────────────────────────────────────────────────────

export interface ReviewsCardProps {
  review: string;
  reviewHtml: string;
  isUnreviewed: boolean;
  onReviewChange: (content: string) => void;
  onReviewHtmlChange: (html: string) => void;
  onUnreviewedChange: (checked: boolean) => void;
  onSave: () => Promise<void>;
}

// ── Tab type ──────────────────────────────────────────────────

type ReviewTab = 'editor' | 'preview';

// ── Component ─────────────────────────────────────────────────

export function ReviewsCard({
  reviewHtml,
  isUnreviewed,
  onReviewHtmlChange,
  onUnreviewedChange,
  onSave,
}: ReviewsCardProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>('editor');

  return (
    <CardWrapper
      title="Review"
      icon={<FileText className="w-4 h-4" />}
      onSave={onSave}
      disabled={isUnreviewed}
    >
      {/* "Mark as unreviewed" checkbox */}
      <div className="mb-4">
        <AnimatedCheckbox
          id="mark-as-unreviewed"
          label="Mark as unreviewed"
          checked={isUnreviewed}
          onChange={onUnreviewedChange}
          variant="warning"
        />
        {isUnreviewed && (
          <p className="mt-2 text-xs text-yellow-500/80 pl-8">
            This title is marked as unreviewed. The editor is disabled.
          </p>
        )}
      </div>

      {/* Editor / Preview tabs */}
      <div className="flex items-center gap-1 mb-3" role="tablist" aria-label="Review editor tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'editor'}
          aria-controls="review-editor-panel"
          id="review-editor-tab"
          onClick={() => setActiveTab('editor')}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150',
            activeTab === 'editor'
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'text-text-tertiary hover:text-text-secondary',
          )}
        >
          Editor
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'preview'}
          aria-controls="review-preview-panel"
          id="review-preview-tab"
          onClick={() => setActiveTab('preview')}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150',
            activeTab === 'preview'
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'text-text-tertiary hover:text-text-secondary',
          )}
        >
          Preview
        </button>
      </div>

      {/* Editor panel */}
      {activeTab === 'editor' && (
        <div
          id="review-editor-panel"
          role="tabpanel"
          aria-labelledby="review-editor-tab"
        >
          <RichTextEditor
            content={reviewHtml}
            onChange={onReviewHtmlChange}
            disabled={isUnreviewed}
            placeholder="Write your review..."
          />
        </div>
      )}

      {/* Preview panel */}
      {activeTab === 'preview' && (
        <div
          id="review-preview-panel"
          role="tabpanel"
          aria-labelledby="review-preview-tab"
          className={cn(
            'min-h-[200px] p-4 rounded-lg overflow-y-auto max-h-[400px]',
            'bg-bg-deep/40 border border-white/10',
            'prose prose-invert prose-sm max-w-none',
            'prose-headings:font-heading prose-headings:text-text-primary',
            'prose-p:text-text-secondary prose-p:leading-relaxed',
            'prose-a:text-accent-primary prose-a:no-underline hover:prose-a:underline',
            'prose-strong:text-text-primary',
            'prose-code:text-accent-secondary prose-code:bg-bg-surface/60 prose-code:px-1 prose-code:rounded',
          )}
        >
          {reviewHtml ? (
            <div dangerouslySetInnerHTML={{ __html: reviewHtml }} />
          ) : (
            <p className="text-text-tertiary italic text-xs">
              Preview will appear here as you write...
            </p>
          )}
        </div>
      )}
    </CardWrapper>
  );
}
