'use client';

// ============================================================
// ReviewsTab — dedicated section for reviews and ratings
// ============================================================

import { RatingDisplay } from '@/components/title/RatingDisplay';
import { ReviewSection } from '@/components/title/ReviewSection';
import type { Title } from '@/types/title';

interface ReviewsTabProps {
  title: Title;
}

export function ReviewsTab({ title }: ReviewsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 py-6">
      {/* Main Review Content */}
      <div className="flex flex-col gap-8">
        {title.review ? (
          <ReviewSection
            review={title.review}
            vibeCheck={title.vibeCheck}
            quotableLines={title.quotableLines}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-10 rounded-2xl bg-surface-elevated/10 border border-white/5 border-dashed">
            <p className="font-heading text-sm uppercase tracking-widest text-text-tertiary mb-2">No Review Available</p>
            <p className="font-body text-xs text-text-tertiary">The curator has not written a review for this title yet.</p>
          </div>
        )}
      </div>

      {/* Sidebar: Ratings & Score Breakdown */}
      <aside className="flex flex-col gap-6">
        {title.ratings ? (
          <div className="flex flex-col gap-5 p-6 rounded-2xl bg-surface-elevated/20 border border-white/10 shadow-lg backdrop-blur-sm sticky top-24">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-accent-secondary/10 text-accent-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </span>
              <h2 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-text-primary">
                Score Breakdown
              </h2>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-2 mb-4">
                <span className="font-display text-4xl font-bold text-text-primary leading-none">
                  {title.ratings.overall.toFixed(1)}
                </span>
                <span className="font-heading text-xs font-bold uppercase tracking-widest text-text-tertiary pb-1">
                  / 10
                </span>
              </div>
              <RatingDisplay ratings={title.ratings} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-elevated/10 border border-white/5">
            <p className="font-body text-xs text-text-tertiary">No ratings yet.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
