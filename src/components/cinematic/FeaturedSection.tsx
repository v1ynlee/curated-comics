"use client";

// ============================================================
// FeaturedSection — cinematic featured titles showcase
// Asymmetric layout: first title gets hero treatment,
// remaining titles in a staggered grid with varied sizes.
// Source of truth: docs/design/UI_UX_DIRECTION.md
// ============================================================

import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { TitleCard } from "@/components/library/TitleCard";
import { TitleCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useFeaturedTitles } from "@/hooks/useTitles";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils/cn";

export function FeaturedSection() {
  const { data: titles, isLoading, error } = useFeaturedTitles(6);
  const prefersReduced = usePrefersReducedMotion();

  const hasTitles = !isLoading && titles && titles.length > 0;
  const remainingTitles = hasTitles ? titles.slice(1) : [];

  return (
    <section
      aria-labelledby="featured-heading"
      className="container-content py-24"
    >
      {/* Section header */}
      <ScrollReveal className="flex flex-col gap-2 mb-12">
        <span className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary">
          Handpicked
        </span>
        <h2
          id="featured-heading"
          className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold text-text-primary leading-tight"
        >
          Featured Titles
        </h2>
        <p className="font-body text-text-secondary max-w-md">
          The ones that left a mark. Rated, reviewed, and worth your time.
        </p>
      </ScrollReveal>

      {/* Asymmetric grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 row-span-2">
            <TitleCardSkeleton />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <TitleCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="state-empty">
          <p className="font-body text-text-secondary">
            Could not load featured titles. Check back soon.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : hasTitles ? (
        <motion.div
          className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {/* Remaining titles — standard size */}
          {remainingTitles.map((title, i) => (
            <motion.div
              key={title.id}
              variants={{
                hidden: { opacity: 0, y: prefersReduced ? 0 : 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <TitleCard title={title} index={i + 1} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="state-empty">
          <p className="font-body text-text-secondary">
            Featured titles are being curated. Explore the full library in the
            meantime.
          </p>
          <Button variant="secondary" size="md" asChild>
            <Link href="/library">Browse Library</Link>
          </Button>
        </div>
      )}

      {/* CTA */}
      {hasTitles && (
        <ScrollReveal className="flex justify-center mt-14">
          <Button variant="secondary" size="lg" asChild>
            <Link href="/library">View Full Library</Link>
          </Button>
        </ScrollReveal>
      )}
    </section>
  );
}
