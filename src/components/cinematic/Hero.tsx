'use client';

// ============================================================
// Hero — cinematic landing hero section
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/motion/MOTION_SYSTEM.md — First Load Sequence
// ============================================================

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AtmosphericBg } from './AtmosphericBg';
import { GradientText } from '@/components/ui/GradientText';
import { Button } from '@/components/ui/Button';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { gsap, ScrollTrigger } from '@/lib/gsap-setup';
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

  // Parallax on scroll — hero content drifts up as user scrolls
  useEffect(() => {
    if (prefersReduced || !containerRef.current) return;

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

    return () => ctx.revert();
  }, [prefersReduced]);

  const stagger = prefersReduced ? 0 : 1;

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Atmospheric background */}
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
