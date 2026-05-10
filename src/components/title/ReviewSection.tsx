// ============================================================
// ReviewSection — personal review display
// Source of truth: docs/design/UI_UX_DIRECTION.md
// ============================================================

import { cn } from '@/lib/cn';
import type { Review } from '@/types/title';

interface ReviewSectionProps {
  review: Review;
  className?: string;
}

export function ReviewSection({ review, className }: ReviewSectionProps) {
  return (
    <section
      aria-labelledby="review-heading"
      className={cn('flex flex-col gap-6', className)}
    >
      <h2
        id="review-heading"
        className="font-display text-2xl font-bold text-text-primary"
      >
        My Review
      </h2>

      {/* TL;DR */}
      {review.tldr && (
        <div className="border-l-2 border-accent-primary/40 pl-4">
          <p className="font-body text-base text-text-accent leading-relaxed italic">
            {review.tldr}
          </p>
        </div>
      )}

      {/* Main body */}
      <div className="font-body text-base text-text-secondary leading-[1.75] whitespace-pre-wrap">
        {review.body}
      </div>

      {/* Structured sections */}
      {(review.whatILoved || review.whatIHated || review.emotionalDamage || review.wouldRecommendTo) && (
        <div className="grid gap-4 sm:grid-cols-2 mt-2">
          {review.whatILoved && (
            <ReviewBlock
              label="What I Loved"
              content={review.whatILoved}
              color="text-semantic-success"
            />
          )}
          {review.whatIHated && (
            <ReviewBlock
              label="What I Hated"
              content={review.whatIHated}
              color="text-semantic-danger"
            />
          )}
          {review.emotionalDamage && (
            <ReviewBlock
              label="Emotional Damage"
              content={review.emotionalDamage}
              color="text-accent-quaternary"
            />
          )}
          {review.wouldRecommendTo && (
            <ReviewBlock
              label="Would Recommend To"
              content={review.wouldRecommendTo}
              color="text-accent-tertiary"
            />
          )}
        </div>
      )}

      {/* Spoiler warning */}
      {review.hasSpoilers && (
        <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-semantic-warning">
          ⚠ This review contains spoilers
        </p>
      )}

      {/* Meta */}
      <p className="font-data text-xs text-text-tertiary">
        Written {new Date(review.writtenDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
        {review.wordCount > 0 && ` · ${review.wordCount} words`}
      </p>
    </section>
  );
}

function ReviewBlock({
  label,
  content,
  color,
}: {
  label: string;
  content: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-sm bg-surface-elevated/50 border border-white/5">
      <span className={cn('font-heading text-[10px] uppercase tracking-[0.2em]', color)}>
        {label}
      </span>
      <p className="font-body text-sm text-text-secondary leading-relaxed">
        {content}
      </p>
    </div>
  );
}
