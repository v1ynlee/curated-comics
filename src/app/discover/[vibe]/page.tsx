'use client';

// ============================================================
// /discover/[vibe] — Dedicated Vibe Detail Page
//
// Route: /discover/aura-farming, /discover/brainrot, etc.
//
// Shows:
//   - Back button → /discover
//   - Vibe name, badge, description, atmosphere accent
//   - Full title grid filtered to this vibe (DiscoveryGrid)
//
// Mobile UX: user taps a vibe card → lands here directly
// without needing to scroll back. Clean, focused, route-based.
// ============================================================

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { DiscoveryGrid } from '@/components/discover/DiscoveryGrid';
import { useMood } from '@/hooks/useMoods';
import type { Mood } from '@/types/title';

interface VibePageProps {
  params: Promise<{ vibe: string }>;
}

// ── Loading skeleton ──────────────────────────────────────────
function VibeSkeleton() {
  return (
    <div className="flex flex-col gap-3 mb-10 animate-pulse">
      <div className="h-3 w-16 rounded bg-surface-elevated" />
      <div className="h-8 w-48 rounded bg-surface-elevated" />
      <div className="h-4 w-72 rounded bg-surface-elevated" />
    </div>
  );
}

// ── 404-style not found ───────────────────────────────────────
function VibeNotFound({ slug }: { slug: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="font-heading text-lg text-text-primary">Vibe not found</p>
      <p className="font-body text-sm text-text-muted">
        <span className="font-mono text-[#8b5cf6]">{slug}</span> doesn&apos;t match any known vibe.
      </p>
      <button
        type="button"
        onClick={() => router.push('/discover')}
        className="mt-2 px-4 py-2 rounded-md bg-[rgba(139,92,246,0.12)] text-[#8b5cf6] text-sm font-heading font-semibold hover:bg-[rgba(139,92,246,0.2)] transition-colors"
      >
        Back to Discover
      </button>
    </div>
  );
}

// ── Vibe header ───────────────────────────────────────────────
function VibeHeader({ mood }: { mood: Mood }) {
  const router = useRouter();
  const accent = mood.atmosphere?.accentColor ?? '#8b5cf6';

  return (
    <motion.div
      className="flex flex-col gap-3 mb-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.push('/discover')}
        className="flex items-center gap-1.5 self-start text-text-muted hover:text-text-primary transition-colors group"
        aria-label="Back to Discover"
      >
        <ArrowLeft
          className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
          aria-hidden
        />
        <span className="font-heading text-[11px] uppercase tracking-[0.2em]">Discover</span>
      </button>

      {/* Vibe name */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1
          className="font-heading font-black text-3xl sm:text-4xl leading-tight"
          style={{
            color: accent,
            textShadow: `0 0 40px ${accent}44`,
          }}
        >
          {mood.name}
        </h1>
      </div>

      {/* Description */}
      {mood.description && (
        <p className="font-body text-text-secondary max-w-lg text-sm leading-relaxed">
          {mood.description}
        </p>
      )}

      {/* Thin accent divider */}
      <div
        className="h-px w-12 mt-1 rounded-full"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
        aria-hidden
      />
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function VibePage({ params }: VibePageProps) {
  const { vibe: slug } = use(params);
  const { data: mood, isLoading, isError } = useMood(slug);

  return (
    <div className="container-content pt-6 md:pt-8 pb-16">
      {isLoading ? (
        <VibeSkeleton />
      ) : isError || !mood ? (
        <VibeNotFound slug={slug} />
      ) : (
        <>
          <VibeHeader mood={mood} />
          <DiscoveryGrid activeMood={mood} />
        </>
      )}
    </div>
  );
}
