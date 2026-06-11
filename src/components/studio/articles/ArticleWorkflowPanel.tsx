'use client';

import { CheckCircle2, CircleAlert } from 'lucide-react';
import { StudioSelect } from '@/components/studio/shared/StudioSelect';
import { cn } from '@/lib/utils/cn';
import { EDITORIAL_STATE_OPTIONS } from './article-editor-constants';
import type { EditorialState } from '@/types/article';
import type { ArticleWorkflowValidation } from '@/services/studio/article-workflow';

interface ArticleWorkflowPanelProps {
  editorialState: EditorialState;
  validation: ArticleWorkflowValidation;
  onEditorialStateChange: (value: EditorialState) => void;
}

export function ArticleWorkflowPanel({ editorialState, validation, onEditorialStateChange }: ArticleWorkflowPanelProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-bg-surface/40 p-4">
      <div className="mb-4">
        <h2 className="font-heading text-sm font-semibold text-text-primary">Review Checklist</h2>
        <p className="mt-1 text-xs text-text-tertiary">
          {validation.readyForReview ? 'Ready for editorial review.' : `${validation.failedChecks.length} item${validation.failedChecks.length === 1 ? '' : 's'} blocking review.`}
        </p>
      </div>

      <StudioSelect
        label="Editorial state"
        value={editorialState}
        options={EDITORIAL_STATE_OPTIONS}
        onChange={onEditorialStateChange}
        buttonClassName="min-h-10"
      />

      <div className="mt-4 space-y-2">
        {validation.checks.map((check) => {
          const Icon = check.passed ? CheckCircle2 : CircleAlert;
          return (
            <div key={check.key} className="flex items-start gap-2 rounded-md border border-white/10 px-3 py-2">
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', check.passed ? 'text-semantic-success' : 'text-semantic-warning')} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-primary">{check.label}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">{check.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
