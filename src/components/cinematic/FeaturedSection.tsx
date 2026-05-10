'use client';

// ============================================================
// FeaturedSection — featured titles showcase on landing page
// Source of truth: docs/design/UI_UX_DIRECTION.md
// ============================================================

import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TitleCard } from '@/components/library/TitleCard';
import { TitleCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useFeaturedTitles } from '@/hooks/useTitles';

export function FeaturedSection() {
  const { data: titles, isLoading } = useFeaturedTitles(6);

  const hasTitles = !isLoading && titles && titles.length > 0;

  return (
    <section
      aria-labelledby="featured-heading"
      className="container-content py-24"
    >
      {/* Section header */}
      <ScrollReveal className="flex flex-col gap-2 mb-10">
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

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TitleCardSkeleton key={i} />
          ))}
        </div>
      ) : hasTitles ? (
        <ul
          role="list"
          aria-label="Featured titles"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {titles.map((title, i) => (
            <li key={title.id}>
              <TitleCard title={title} index={i} />
            </li>
          ))}
        </ul>
      ) : null}

      {/* CTA */}
      <ScrollReveal className="flex justify-center mt-12">
        <Button variant="secondary" size="lg" asChild>
          <Link href="/library">View Full Library</Link>
        </Button>
      </ScrollReveal>
    </section>
  );
}
