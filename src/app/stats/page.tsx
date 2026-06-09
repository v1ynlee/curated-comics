"use client";

// ============================================================
// Statistics & Achievements Page
// Source of truth: docs/roadmap/ROADMAP.md — Phase 3
//                  docs/design/UI_UX_DIRECTION.md — Statistics View
// ============================================================

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/stats/StatCard";
import { GenreChart } from "@/components/stats/GenreChart";
import { TimelineChart } from "@/components/stats/TimelineChart";
import { ReadingStreak } from "@/components/stats/ReadingStreak";
import { YearlyArc } from "@/components/stats/YearlyArc";
import { BadgeGrid } from "@/components/achievements/BadgeGrid";
import { PageHeading } from "@/components/ui/PageHeading";
import { useReadingStatistics, useAchievements } from "@/hooks/useStats";
import {
  BookOpen,
  BookMarked,
  Clock,
  Star,
  BarChart3,
  Trophy,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils/cn";

export default function StatsPage() {
  const { data: stats, isLoading: statsLoading } = useReadingStatistics();
  const { data: achievements = [], isLoading: achievementsLoading } =
    useAchievements();

  return (
    <div className="relative min-h-screen overflow-x-hidden -mt-14 md:-mt-16">
      {/* ── Ambient Background Glows ─────────────────────────── */}
      <div className="absolute top-0 inset-x-0 w-full h-[1200px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-20%] md:left-[5%] w-[400px] md:w-[600px] h-[600px] rounded-full bg-accent-tertiary/10 blur-[120px]" />
        <div className="absolute top-[15%] right-[-20%] md:right-[5%] w-[400px] md:w-[500px] h-[500px] rounded-full bg-accent-primary/10 blur-[100px]" />
      </div>

      <div className="container-content pt-12 md:pt-20 pb-24">
        {/* ── Navigation ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Breadcrumb
            className="mb-10 md:mb-5"
            items={[{ label: "Home", href: "/" }, { label: "Statistics" }]}
          />
        </motion.div>

        {/* ── Page Header ────────────────────────────────────── */}
        <motion.div
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glassmorphic Pill Label
          <span
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6",
              "bg-text-primary/5 border border-text-primary/10",
              "font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary",
            )}
          >
            <BarChart3 size={14} className="text-accent-tertiary" />
            Reading Data
          </span> */}

          <PageHeading className="mb-6">Statistics</PageHeading>

          <p className="font-body text-base md:text-lg text-text-secondary max-w-lg text-balance leading-relaxed">
            Every chapter, every hour, every title — visualized.
          </p>

          {/* Subtle divider line */}
          <div className="w-12 h-[1px] bg-text-primary/20 mt-10" />
        </motion.div>

        {/* ── Volume Stats ─────────────────────────────────────── */}
        <section aria-labelledby="volume-heading" className="mb-16 md:mb-24">
          <ScrollReveal>
            <h2
              id="volume-heading"
              className="flex items-center gap-3 font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary mb-6 md:mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
              Reading Volume
            </h2>
          </ScrollReveal>

          {statsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <StatCard
                label="Titles Read"
                value={stats.totalTitles}
                color="var(--color-accent-primary)"
                icon={<BookOpen size={20} />}
                index={0}
              />
              <StatCard
                label="Chapters Read"
                value={stats.totalChaptersRead}
                color="var(--color-accent-tertiary)"
                icon={<BookMarked size={20} />}
                index={1}
              />
              <StatCard
                label="Hours Reading"
                value={stats.estimatedReadingHours}
                suffix="h"
                decimals={1}
                color="var(--color-accent-secondary)"
                icon={<Clock size={20} />}
                index={2}
              />
              <StatCard
                label="Avg Rating"
                value={stats.averageRating}
                decimals={1}
                suffix=" / 10"
                color="var(--color-accent-quaternary)"
                icon={<Star size={20} />}
                index={3}
              />
            </div>
          ) : null}
        </section>

        {/* ── Secondary Stats ───────────────────────────────────── */}
        {stats && !statsLoading && (
          <section
            aria-labelledby="secondary-heading"
            className="mb-16 md:mb-24"
          >
            <ScrollReveal>
              <h2
                id="secondary-heading"
                className="flex items-center gap-3 font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary mb-6 md:mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-semantic-success" />
                Breakdown
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label="Completed"
                value={stats.statusDistribution["completed"] ?? 0}
                color="var(--color-semantic-success)"
                index={0}
              />
              <StatCard
                label="Dropped"
                value={stats.statusDistribution["dropped"] ?? 0}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 mb-16 md:mb-24">
          {/* Genre Distribution */}
          <section aria-labelledby="genre-chart-heading">
            <ScrollReveal>
              <h2
                id="genre-chart-heading"
                className="flex items-center gap-3 font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary mb-6 md:mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-quaternary" />
                Genre Distribution
              </h2>
            </ScrollReveal>

            {statsLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 rounded-sm" />
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
                  className="flex items-center gap-3 font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary mb-6 md:mb-8"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                  Origin Split
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-3 gap-4">
                {Object.entries(stats.originDistribution).map(
                  ([origin, count], i) => (
                    <StatCard
                      key={origin}
                      label={origin.charAt(0).toUpperCase() + origin.slice(1)}
                      value={count}
                      index={i}
                    />
                  ),
                )}
              </div>
            </section>
          )}
        </div>

        {/* ── Timeline ─────────────────────────────────────────── */}
        <section aria-labelledby="timeline-heading" className="mb-16 md:mb-24">
          <ScrollReveal>
            <h2
              id="timeline-heading"
              className="flex items-center gap-3 font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary mb-6 md:mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
              Monthly Reading
            </h2>
          </ScrollReveal>

          {statsLoading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : stats && stats.monthlyChapters.length > 0 ? (
            <TimelineChart monthlyChapters={stats.monthlyChapters} />
          ) : (
            <p className="font-body text-sm text-text-tertiary">
              No reading history yet.
            </p>
          )}
        </section>

        {/* ── Yearly Arc + Streak ───────────────────────────────── */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-8 mb-24 md:mb-32">
            <section aria-labelledby="yearly-heading">
              <ScrollReveal>
                <h2
                  id="yearly-heading"
                  className="flex items-center gap-3 font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary mb-6 md:mb-8"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                  Yearly Arc
                </h2>
              </ScrollReveal>
              <YearlyArc yearlyTitles={stats.yearlyTitles} />
            </section>

            <section aria-labelledby="streak-heading">
              <ScrollReveal>
                <h2
                  id="streak-heading"
                  className="flex items-center gap-3 font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary mb-6 md:mb-8"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-semantic-warning" />
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
        <section
          aria-labelledby="achievements-heading"
          className="border-t border-text-primary/10 pt-20"
        >
          <ScrollReveal>
            <div className="flex flex-col items-center text-center gap-4 mb-16">
              <span
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
                  "bg-accent-secondary/10 border border-accent-secondary/20",
                  "font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-accent-secondary",
                )}
              >
                <Trophy size={14} />
                Milestones
              </span>
              <h2
                id="achievements-heading"
                className="font-display text-[clamp(2rem,5vw,3rem)] font-bold text-text-primary tracking-tight"
              >
                Achievements
              </h2>
              <p className="font-body text-base md:text-lg text-text-secondary max-w-md text-balance">
                Badges earned through reading milestones and deep genre
                exploration.
              </p>
            </div>
          </ScrollReveal>

          <BadgeGrid
            achievements={achievements}
            isLoading={achievementsLoading}
          />
        </section>
      </div>
    </div>
  );
}
