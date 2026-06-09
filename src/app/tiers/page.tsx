"use client";

// ============================================================
// Tiers Page — Visual Tier List
// Source of truth: docs/roadmap/ROADMAP.md — Phase 2: Tier List
//                  docs/design/UI_UX_DIRECTION.md — Tier List View
// ============================================================

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { TierRow } from "@/components/tiers/TierRow";
import { useTierGroups } from "@/hooks/useTiers";
import { TIER_CONFIG } from "@/types/title";
import { PageHeading } from "@/components/ui/PageHeading";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils/cn";
import type { TierLevel } from "@/types/title";

const TIER_ORDER: TierLevel[] = ["SSS+", "S", "A", "B", "C", "D", "F"];

export default function TiersPage() {
  const { data: groups = [], isLoading } = useTierGroups();

  // Build a map for quick lookup
  const groupMap = new Map(groups.map((g) => [g.tier, g]));

  return (
    <div className="relative min-h-screen overflow-x-hidden -mt-14 md:-mt-16">
      {/* ── Ambient Background Glows ─────────────────────────── */}
      <div className="absolute top-0 inset-x-0 w-full h-[800px] overflow-hidden pointer-events-none -z-10">
        {/* Left gold glow (representing SSS+) */}
        <div className="absolute top-[-10%] left-[-20%] md:left-[10%] w-[400px] md:w-[600px] h-[500px] rounded-full bg-accent-secondary/15 blur-[120px]" />
        {/* Right purple glow */}
        <div className="absolute top-[5%] right-[-20%] md:right-[10%] w-[400px] md:w-[500px] h-[500px] rounded-full bg-accent-primary/10 blur-[100px]" />
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
            items={[{ label: "Home", href: "/" }, { label: "Tier List" }]}
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
          <span className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6",
            "bg-text-primary/5 border border-text-primary/10",
            "font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary"
          )}>
            <Crown size={14} className="text-accent-secondary" />
            Personal Rankings
          </span> */}

          <PageHeading className="mb-6">Tier List</PageHeading>

          <p className="font-body text-base md:text-lg text-text-secondary max-w-lg text-balance leading-relaxed">
            Every title I&apos;ve read, ranked from transcendent to trash.
            Scroll horizontally through each tier to explore.
          </p>

          {/* Subtle divider line */}
          <div className="w-12 h-[1px] bg-text-primary/20 mt-10 mb-8" />

          {/* ── Tier Legend ──────────────────────────────────── */}
          <div className="flex flex-wrap justify-center gap-2.5 max-w-xl">
            {TIER_ORDER.map((tier) => {
              const config = TIER_CONFIG[tier];
              return (
                <span
                  key={tier}
                  className="font-heading text-[11px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-sm transition-transform hover:scale-105 cursor-default"
                  style={{
                    color: config?.color || "var(--color-text-primary)",
                    // Using color-mix to create dynamic glassmorphic opacities directly from the config hex code
                    backgroundColor: `color-mix(in srgb, ${config?.color || "#fff"} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${config?.color || "#fff"} 25%, transparent)`,
                    boxShadow: `0 4px 12px color-mix(in srgb, ${config?.color || "#fff"} 5%, transparent)`,
                  }}
                >
                  {tier}
                </span>
              );
            })}
          </div>
        </motion.div>

        {/* ── Tier Rows ──────────────────────────────────────── */}
        <motion.div
          className="flex flex-col gap-8 md:gap-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {isLoading
            ? TIER_ORDER.slice(0, 4).map((tier, i) => (
                <TierRow
                  key={tier}
                  tier={tier}
                  titles={[]}
                  isLoading
                  index={i}
                />
              ))
            : TIER_ORDER.map((tier, i) => {
                const group = groupMap.get(tier);
                if (!group) return null;
                return (
                  <TierRow
                    key={tier}
                    tier={tier}
                    titles={group.titles}
                    index={i}
                  />
                );
              })}
        </motion.div>
      </div>
    </div>
  );
}
