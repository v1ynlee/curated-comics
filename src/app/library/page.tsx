// ============================================================
// Library Browse Page
// Source of truth: docs/roadmap/ROADMAP.md — Phase 1: Library Browse
// ============================================================

import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { LibraryGrid } from "@/components/library/LibraryGrid";
import { PageHeading } from "@/components/ui/PageHeading";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Browse my complete reading archive — manhwa, manhua, and manga.",
};

export default function LibraryPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden -mt-14 md:-mt-16">
      {/* ── Ambient Background Glows ─────────────────────────── */}
      {/* Using full width to prevent clipping, matching the Discover page fix */}
      <div className="absolute top-0 inset-x-0 w-full h-[800px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-20%] md:left-[15%] w-[400px] md:w-[600px] h-[500px] rounded-full bg-accent-primary/10 blur-[120px]" />
        <div className="absolute top-[5%] right-[-20%] md:right-[15%] w-[400px] md:w-[500px] h-[500px] rounded-full bg-accent-tertiary/10 blur-[120px]" />
      </div>

      <div className="container-content pt-12 md:pt-20 pb-24">
        {/* ── Navigation ─────────────────────────────────────── */}
        <Breadcrumb
          className="mb-10 md:mb-5"
          items={[{ label: "Home", href: "/" }, { label: "Library" }]}
        />

        {/* ── Page Header ────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 md:mb-12">
          {/* Glassmorphic Pill Label
          <span
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6",
              "bg-text-primary/5 border border-text-primary/10",
              "font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary",
            )}
          >
            <BookOpen size={14} className="text-accent-primary" />
            Complete Reading Archive
          </span> */}

          <PageHeading className="mb-6">Library</PageHeading>

          <p className="font-body text-base md:text-lg text-text-secondary max-w-lg text-balance leading-relaxed">
            Every title I&apos;ve read, rated, and catalogued. Filter by genre,
            sort by rating, and explore the collection.
          </p>

          {/* Subtle divider line */}
          <div className="w-12 h-[1px] bg-text-primary/20 mt-10" />
        </div>

        {/* ── Grid with Filters ──────────────────────────────── */}
        <section aria-label="Library Grid">
          <LibraryGrid />
        </section>
      </div>
    </div>
  );
}
