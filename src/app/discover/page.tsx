"use client";

// ============================================================
// /discover — Vibe Discovery Index
//
// Shows: page header + VibeGrid (browse by vibe).
// Clicking a card → /discover/[vibe] (dedicated detail page).
// ============================================================

import { motion } from "framer-motion";
import { Sparkles, Headphones } from "lucide-react";
import { VibeGrid } from "@/components/discover/VibeGrid";
import { PageHeading } from "@/components/ui/PageHeading";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils/cn";

export default function DiscoverPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden -mt-14 md:-mt-16">
      {/* ── Ambient Background Glows (FIXED) ─────────────────── */}
      {/* Removed max-w-5xl. The container now spans full width (w-full). 
        This prevents overflow-hidden from sharply clipping the 120px blur, 
        eliminating the hard rectangular box artifact in light mode.
      */}
      <div className="absolute top-0 inset-x-0 w-full h-[800px] overflow-hidden pointer-events-none -z-10">
        {/* Left purple glow */}
        <div className="absolute top-[-10%] left-[-20%] md:left-[5%] w-[400px] md:w-[600px] h-[500px] rounded-full bg-accent-primary/10 blur-[120px]" />
        {/* Right pink/red glow */}
        <div className="absolute top-[5%] right-[-20%] md:right-[5%] w-[400px] md:w-[500px] h-[500px] rounded-full bg-accent-quaternary/10 blur-[100px]" />
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
            items={[{ label: "Home", href: "/" }, { label: "Discover" }]}
          />
        </motion.div>

        {/* ── Page Header ────────────────────────────────────── */}
        <motion.div
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top Label
          <span className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6",
            "bg-text-primary/5 border border-text-primary/10",
            "font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary"
          )}>
            <Headphones size={14} className="text-accent-secondary" />
            Mood-Based Discovery
          </span> */}

          <PageHeading className="mb-6">Discover</PageHeading>

          <p className="font-body text-base md:text-lg text-text-secondary max-w-lg text-balance leading-relaxed">
            Find your next read by vibe. Each mood is a different frequency —
            tune in and explore the archive.
          </p>

          {/* Subtle divider line */}
          <div className="w-12 h-[1px] bg-text-primary/20 mt-10" />
        </motion.div>

        {/* ── Browse by Vibe Grid ────────────────────────────── */}
        <motion.section
          aria-label="Browse by Vibe"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <VibeGrid />
        </motion.section>
      </div>
    </div>
  );
}
