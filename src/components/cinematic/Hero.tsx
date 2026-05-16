'use client';

// ============================================================
// Hero — cinematic landing hero section
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/motion/MOTION_SYSTEM.md — First Load Sequence
//
// Font: Morvein (local, src/fonts/Morvein/Morvien-Regular.woff2)
//       loaded via next/font/local → CSS var --font-morvein
//       mapped to --font-hero in @theme inline.
//
// Layout:
//   Desktop (md+): hero title words sit side-by-side horizontally
//   Mobile (<md):  hero title words stack vertically, compact spacing
//
// Colors:
//   Dark theme:  soft off-white (#e8e8f0), NOT pure white
//   Light theme: deep charcoal (#1a1a2e), NOT pure black
//   First word:  always accent gradient (purple → pink)
//
// Background images:
//   dark  → /images/background.png
//   light → /images/background-light.png
// ============================================================

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GradientText } from '@/components/ui/GradientText';
import { Button } from '@/components/ui/Button';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useUIStore } from '@/stores/useUIStore';
import { getGSAP } from '@/lib/animation/gsap-setup';
import { cn } from '@/lib/utils/cn';

const SEQUENCE = {
  label: 0.2,
  title: 0.5,
  subtitle: 0.8,
  cta: 1.0,
  scroll: 1.5,
};

export function Hero() {
  const prefersReduced = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    if (prefersReduced || !containerRef.current) return;

    let cleanup: (() => void) | undefined;

    getGSAP().then((g) => {
      if (!g || !containerRef.current) return;
      const { gsap, ScrollTrigger } = g;

      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            gsap.set('.hero-content', {
              y: self.progress * -60,
              opacity: 1 - self.progress * 0.6,
            });
          },
        });
      }, containerRef);

      cleanup = () => ctx.revert();
    });

    return () => cleanup?.();
  }, [prefersReduced]);

  const stagger = prefersReduced ? 0 : 1;
  const bgSrc = theme === 'light'
    ? '/images/background-light.png'
    : '/images/background.png';
  const bgOpacity = theme === 'light' ? 0.25 : 0.18;

  /*
    Soft text colors — avoid pure white (#fff) in dark and pure black (#000) in light.
    Dark:  #e8e8f0 — warm off-white, easy on the eyes
    Light: #1a1a2e — deep charcoal-navy, not harsh black
  */
  const heroTextColor = theme === 'light' ? '#1a1a2e' : '#e8e8f0';

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* ── Background image — theme-aware ─────────────────── */}
      <motion.div
        key={bgSrc}
        className="absolute inset-0 -z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        aria-hidden="true"
      >
        <Image
          src={bgSrc}
          alt=""
          fill
          priority
          quality={85}
          className="object-cover object-center"
          style={{ opacity: bgOpacity }}
          sizes="100vw"
        />
        {/* Gradient overlay — inline CSS vars resolve correctly in both themes */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom,
              color-mix(in srgb, var(--color-bg-deep) 55%, transparent) 0%,
              color-mix(in srgb, var(--color-bg-deep) 35%, transparent) 40%,
              color-mix(in srgb, var(--color-bg-deep) 75%, transparent) 100%)`,
          }}
        />
      </motion.div>

      {/* ── Corner accent gradients — theme-aware ──────────── */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[160px]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-primary) 7%, transparent)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-quaternary) 5%, transparent)' }}
        />
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="hero-content container-content flex flex-col items-center gap-5 text-center pt-16 md:pt-0">

        {/* Section label */}
        <motion.span
          className="font-heading text-xs font-medium uppercase tracking-[0.25em] text-text-tertiary"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: SEQUENCE.label * stagger, duration: 0.6 }}
        >
          Personal Reading Archive
        </motion.span>

        {/*
          Hero heading — Morvein font
          Desktop: "Comic Curated" side-by-side on one line
          Mobile:  "Comic" and "Curated" stacked vertically, compact gap
        */}
        <motion.h1
          id="hero-title"
          className="heading-glow"
          style={{ fontFamily: 'var(--font-hero)' }}
          initial={{ opacity: 0, y: prefersReduced ? 0 : 24, filter: prefersReduced ? 'none' : 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: SEQUENCE.title * stagger, duration: 0.8, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          {/*
            Desktop: flex-row — words sit side by side
            Mobile:  flex-col — words stack vertically
            The gap is tight on mobile (gap-0) to keep it compact.
          */}
          <span className={cn(
            'flex leading-[0.95] tracking-tight',
            'text-[clamp(3.5rem,11vw,9rem)]',
            // Mobile: vertical stack, compact
            'flex-col gap-0',
            // Desktop: horizontal, single line with a small gap
            'md:flex-row md:gap-[0.2em] md:items-baseline',
          )}>
            {/* "Comic" — accent gradient, always vivid */}
            <GradientText>Comic</GradientText>

            {/* "Curated" — soft theme-aware color, NOT pure white/black */}
            <span style={{ color: heroTextColor }}>Curated</span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="max-w-lg font-body text-base font-light md:text-lg"
          style={{ color: theme === 'light' ? '#3a3a5c' : '#b0b0c8' }}
          initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: SEQUENCE.subtitle * stagger, duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          Korean manhwa · Chinese manhua · Japanese manga
          <br />
          <span
            className="text-sm"
            style={{ color: theme === 'light' ? '#5a5a80' : '#7a7a98' }}
          >
            A cinematic showcase of every title I&apos;ve read, rated, and loved.
          </span>
        </motion.p>

        {/* CTA */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-1"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: SEQUENCE.cta * stagger, duration: 0.5 }}
        >
          <Button size="lg" asChild>
            <Link href="/library">Browse Library</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/discover">Discover by Mood</Link>
          </Button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: SEQUENCE.scroll * stagger, duration: 0.5 }}
          aria-hidden="true"
        >
          <span
            className="font-heading text-[10px] uppercase tracking-[0.2em]"
            style={{ color: theme === 'light' ? '#7a7a98' : '#6b6b80' }}
          >
            Scroll
          </span>
          <motion.div
            className="h-8 w-px"
            style={{
              background: `linear-gradient(to bottom, ${theme === 'light' ? '#7a7a98' : '#6b6b80'}, transparent)`,
            }}
            animate={{ scaleY: [1, 0.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
}
