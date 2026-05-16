// ============================================================
// ReviewSection — personal review display with enhanced features
// ============================================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Review } from '@/types/title';

interface ReviewSectionProps {
  review: Review;
  vibeCheck?: string;
  quotableLines?: string[];
  className?: string;
}

export function ReviewSection({ review, vibeCheck, quotableLines, className }: ReviewSectionProps) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);

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

      {/* Vibe Check */}
      {vibeCheck && (
        <div className="flex flex-col gap-1">
          <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Vibe Check
          </span>
          <p className="font-accent text-xl text-text-accent leading-snug">
            &ldquo;{vibeCheck}&rdquo;
          </p>
        </div>
      )}

      {/* TL;DR */}
      {review.tldr && (
        <div className="border-l-2 border-accent-primary/40 pl-4">
          <p className="font-body text-base text-text-accent leading-relaxed italic">
            {review.tldr}
          </p>
        </div>
      )}

      {/* Main body — spoiler handling */}
      {review.hasSpoilers ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 rounded-sm bg-semantic-warning/10 border border-semantic-warning/20">
            <AlertTriangle size={14} className="text-semantic-warning shrink-0" aria-hidden="true" />
            <span className="font-heading text-[10px] uppercase tracking-[0.15em] text-semantic-warning">
              This review contains spoilers
            </span>
            <button
              onClick={() => setSpoilerRevealed((v) => !v)}
              className={cn(
                'ml-auto font-heading text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm',
                'border transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                spoilerRevealed
                  ? 'border-white/20 text-text-secondary hover:text-text-primary'
                  : 'border-semantic-warning/40 text-semantic-warning hover:bg-semantic-warning/10',
              )}
              aria-expanded={spoilerRevealed}
            >
              {spoilerRevealed ? 'Hide' : 'Reveal'}
            </button>
          </div>

          <AnimatePresence>
            {spoilerRevealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] }}
                className="overflow-hidden"
              >
                <div className="font-body text-base text-text-secondary leading-[1.75] whitespace-pre-wrap pt-2">
                  {review.body}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="font-body text-base text-text-secondary leading-[1.75] whitespace-pre-wrap">
          {review.body}
        </div>
      )}

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

      {/* Quotable Lines */}
      {quotableLines && quotableLines.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Quotable Lines
          </span>
          <div className="flex flex-col gap-2">
            {quotableLines.map((line, i) => (
              <blockquote
                key={i}
                className="border-l border-accent-primary/30 pl-4 font-accent text-base text-text-secondary italic"
              >
                &ldquo;{line}&rdquo;
              </blockquote>
            ))}
          </div>
        </div>
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
