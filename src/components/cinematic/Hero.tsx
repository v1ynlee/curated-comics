'use client';

// ============================================================
// Hero — cinematic landing hero section
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/motion/MOTION_SYSTEM.md — First Load Sequence
//
// Background images:
//   dark  → /images/background.png
//   light → /images/background-light.png
// ============================================================

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AtmosphericBg } from './AtmosphericBg';
import { GradientText } from '@/components/ui/GradientText';
import { Button } from '@/components/ui/Button';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useUIStore } from '@/stores/useUIStore';
import { getGSAP } from '@/lib/gsap-setup';
import { cn } from '@/lib/cn';

// First-load sequence timings (seconds)
const SEQUENCE = {
  bg: 0,
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

  // Parallax on scroll — hero content drifts up as user scrolls
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
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        aria-hidden="true"
      >
        <Image
          src={bgSrc}
          alt=""
          fill
          priority
          quality={85}
          className={cn(
            'object-cover object-center',
            theme === 'light' ? 'opacity-30' : 'opacity-20',
          )}
          sizes="100vw"
        />
        {/* Gradient overlay to blend with UI */}
        <div
          className={cn(
            'absolute inset-0',
            theme === 'light'
              ? 'bg-gradient-to-b from-bg-deep/60 via-bg-deep/40 to-bg-deep/80'
              : 'bg-gradient-to-b from-bg-deep/70 via-bg-deep/50 to-bg-deep/90',
          )}
        />
      </motion.div>

      {/* Atmospheric background (orbs + particles) */}
      <AtmosphericBg className="-z-10" />

      {/* Content */}
      <div className="hero-content container-content flex flex-col items-center gap-6 text-center pt-16 md:pt-0">
        {/* Section label */}
        <motion.span
          className="font-heading text-xs font-medium uppercase tracking-[0.25em] text-text-tertiary"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: SEQUENCE.label * stagger, duration: 0.6 }}
        >
          Personal Reading Archive
        </motion.span>

        {/* Main title */}
        <motion.h1
          id="hero-title"
          className={cn(
            'font-display font-black leading-none tracking-tight',
            'text-[clamp(3rem,10vw,8rem)]',
            'heading-glow',
          )}
          initial={{ opacity: 0, y: prefersReduced ? 0 : 24, filter: prefersReduced ? 'none' : 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: SEQUENCE.title * stagger, duration: 0.8, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          <GradientText>Comic</GradientText>
          <br />
          <span className="text-text-primary">Curated</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="max-w-lg font-body text-lg font-light text-text-secondary md:text-xl"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: SEQUENCE.subtitle * stagger, duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          Korean manhwa · Chinese manhua · Japanese manga
          <br />
          <span className="text-text-tertiary text-base">
            A cinematic showcase of every title I&apos;ve read, rated, and loved.
          </span>
        </motion.p>

        {/* CTA */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-2"
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
          <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Scroll
          </span>
          <motion.div
            className="h-8 w-px bg-gradient-to-b from-text-tertiary to-transparent"
            animate={{ scaleY: [1, 0.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
}
