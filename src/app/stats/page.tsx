'use client';

// ============================================================
// Statistics & Achievements Page
// Source of truth: docs/roadmap/ROADMAP.md — Phase 3
//                  docs/design/UI_UX_DIRECTION.md — Statistics View
// ============================================================

import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/stats/StatCard';
import { GenreChart } from '@/components/stats/GenreChart';
import { TimelineChart } from '@/components/stats/TimelineChart';
import { ReadingStreak } from '@/components/stats/ReadingStreak';
import { YearlyArc } from '@/components/stats/YearlyArc';
import { BadgeGrid } from '@/components/achievements/BadgeGrid';
import { useReadingStatistics, useAchievements } from '@/hooks/useStats';

export default function StatsPage() {
  const { data: stats, isLoading: statsLoading } = useReadingStatistics();
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements();

  return (
    <div className="container-content pt-24 pb-16">
      {/* Page header */}
      <motion.div
        className="flex flex-col gap-2 mb-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] }}
      >
        <span className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary">
          Reading Archive
        </span>
        <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-bold text-text-primary leading-tight">
          Statistics
        </h1>
        <p className="font-body text-text-secondary max-w-md">
          Every chapter, every hour, every title — visualized.
        </p>
      </motion.div>

      {/* ── Volume Stats ─────────────────────────────────────── */}
      <section aria-labelledby="volume-heading" className="mb-16">
        <ScrollReveal>
          <h2
            id="volume-heading"
            className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary mb-6"
          >
            Reading Volume
          </h2>
        </ScrollReveal>

        {statsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard
              label="Titles Read"
              value={stats.totalTitles}
              color="var(--color-accent-primary)"
              icon="📚"
              index={0}
            />
            <StatCard
              label="Chapters Read"
              value={stats.totalChaptersRead}
              color="var(--color-accent-tertiary)"
              icon="📖"
              index={1}
            />
            <StatCard
              label="Hours Reading"
              value={stats.estimatedReadingHours}
              suffix="h"
              decimals={1}
              color="var(--color-accent-secondary)"
              icon="⏱️"
              index={2}
            />
            <StatCard
              label="Avg Rating"
              value={stats.averageRating}
              decimals={1}
              suffix=" / 10"
              color="var(--color-accent-quaternary)"
              icon="⭐"
              index={3}
            />
          </div>
        ) : null}
      </section>

      {/* ── Secondary Stats ───────────────────────────────────── */}
      {stats && !statsLoading && (
        <section aria-labelledby="secondary-heading" className="mb-16">
          <ScrollReveal>
            <h2
              id="secondary-heading"
              className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary mb-6"
            >
              Breakdown
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Completed"
              value={stats.statusDistribution['completed'] ?? 0}
              color="var(--color-semantic-success)"
              index={0}
            />
            <StatCard
              label="Dropped"
              value={stats.statusDistribution['dropped'] ?? 0}
              color="var(--color-semantic-danger)"
              index={1}
            />
            <StatCard
              label="Completion Rate"
              value={stats.completionRate}
              suffix="%"
              decimals={1}
              color="var(--color-accent-tertiary)"
              index={2}
            />
            <StatCard
              label="Avg Chapters"
              value={stats.averageChaptersPerTitle}
              suffix=" ch"
              color="var(--color-text-secondary)"
              index={3}
            />
          </div>
        </section>
      )}

      {/* ── Charts ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Genre Distribution */}
        <section aria-labelledby="genre-chart-heading">
          <ScrollReveal>
            <h2
              id="genre-chart-heading"
              className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary mb-6"
            >
              Genre Distribution
            </h2>
          </ScrollReveal>

          {statsLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
          ) : stats ? (
            <GenreChart distribution={stats.genreDistribution} />
          ) : null}
        </section>

        {/* Origin Distribution */}
        {stats && !statsLoading && (
          <section aria-labelledby="origin-heading">
            <ScrollReveal>
              <h2
                id="origin-heading"
                className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary mb-6"
              >
                Origin Split
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.originDistribution).map(([origin, count], i) => (
                <StatCard
                  key={origin}
                  label={origin.charAt(0).toUpperCase() + origin.slice(1)}
                  value={count}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Timeline ─────────────────────────────────────────── */}
      <section aria-labelledby="timeline-heading" className="mb-16">
        <ScrollReveal>
          <h2
            id="timeline-heading"
            className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary mb-6"
          >
            Monthly Reading
          </h2>
        </ScrollReveal>

        {statsLoading ? (
          <Skeleton className="h-32" />
        ) : stats && stats.monthlyChapters.length > 0 ? (
          <TimelineChart monthlyChapters={stats.monthlyChapters} />
        ) : (
          <p className="font-body text-sm text-text-tertiary">No reading history yet.</p>
        )}
      </section>

      {/* ── Yearly Arc + Streak ───────────────────────────────── */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <section aria-labelledby="yearly-heading">
            <ScrollReveal>
              <h2
                id="yearly-heading"
                className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary mb-6"
              >
                Yearly Arc
              </h2>
            </ScrollReveal>
            <YearlyArc yearlyTitles={stats.yearlyTitles} />
          </section>

          <section aria-labelledby="streak-heading">
            <ScrollReveal>
              <h2
                id="streak-heading"
                className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary mb-6"
              >
                Reading Streak
              </h2>
            </ScrollReveal>
            <ReadingStreak
              current={stats.readingStreak.current}
              longest={stats.readingStreak.longest}
            />
          </section>
        </div>
      )}

      {/* ── Achievements ─────────────────────────────────────── */}
      <section aria-labelledby="achievements-heading">
        <ScrollReveal>
          <div className="flex flex-col gap-2 mb-8">
            <h2
              id="achievements-heading"
              className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-text-primary"
            >
              Achievements
            </h2>
            <p className="font-body text-text-secondary max-w-md">
              Badges earned through reading milestones and genre exploration.
            </p>
          </div>
        </ScrollReveal>

        <BadgeGrid
          achievements={achievements}
          isLoading={achievementsLoading}
        />
      </section>
    </div>
  );
}
