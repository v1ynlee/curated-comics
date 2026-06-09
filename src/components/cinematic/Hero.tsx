'use client';

// ============================================================
// Hero — cinematic landing hero section
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/motion/MOTION_SYSTEM.md — First Load Sequence
// ============================================================

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { GradientText } from '@/components/ui/GradientText';
import { Button } from '@/components/ui/Button';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useUIStore } from '@/stores/useUIStore';
import { getGSAP } from '@/lib/animation/gsap-setup';
import { cn } from '@/lib/utils/cn';

const SEQUENCE = {
  label: 0.3,
  title: 0.6,
  subtitle: 1.0,
  cta: 1.3,
  scroll: 2.0,
};

export function Hero() {
  const prefersReduced = usePrefersReducedMotion();
  const containerRef    = useRef<HTMLDivElement>(null);
  // Ref for the scrollable content — used by GSAP instead of a global
  // CSS selector '.hero-content'. Global selectors fail when the component
  // unmounts during navigation, causing the "target not found" warning.
  const heroContentRef  = useRef<HTMLDivElement>(null);
  
  // Theme is only needed for the physical background image source now; 
  // all typography/colors are handled autonomously via CSS variables.
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    if (prefersReduced || !containerRef.current) return;

    // isMounted guard — getGSAP() is an async dynamic import.
    // In React Strict Mode the cleanup runs BEFORE the Promise resolves,
    // leaving cleanup=undefined. The .then() then fires after unmount,
    // creates a ScrollTrigger on a gone DOM, and the onUpdate selector
    // finds nothing. Setting isMounted=false tells the .then() to abort.
    let isMounted = true;
    let cleanup: (() => void) | undefined;

    getGSAP().then((g) => {
      if (!g || !isMounted || !containerRef.current || !heroContentRef.current) return;
      const { gsap, ScrollTrigger } = g;

      const target = heroContentRef.current; // capture ref value at creation time

      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            // Use the captured DOM node directly — never a global selector.
            // If target was removed from DOM this is a no-op.
            if (!target.isConnected) return;
            gsap.set(target, {
              y: self.progress * -80,
              opacity: 1 - self.progress * 0.7,
              scale: 1 - self.progress * 0.05,
            });
          },
        });
      }, containerRef);

      cleanup = () => ctx.revert();
    });

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, [prefersReduced]);

  const stagger = prefersReduced ? 0 : 1;
  const bgSrc = theme === 'light'
    ? '/images/background-light.png'
    : '/images/background.png';
  const bgOpacity = theme === 'light' ? 0.35 : 0.25;

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden -mt-14 md:-mt-16"
      aria-labelledby="hero-title"
    >
      {/* ── Background image ─────────────────────────────── */}
      <motion.div
        key={bgSrc}
        className="absolute inset-0 -z-20"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
        aria-hidden="true"
      >
        <Image
          src={bgSrc}
          alt=""
          fill
          priority
          quality={90}
          className="object-cover object-center"
          style={{ opacity: bgOpacity }}
          sizes="100vw"
        />
        {/* Gradient overlay adapting to theme variables */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom,
              color-mix(in srgb, var(--color-bg-deep) 60%, transparent) 0%,
              color-mix(in srgb, var(--color-bg-deep) 40%, transparent) 40%,
              color-mix(in srgb, var(--color-bg-deep) 90%, transparent) 100%)`,
          }}
        />
      </motion.div>

      {/* ── Corner accent gradients ──────────────────────── */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[160px]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-primary) 8%, transparent)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-quaternary) 6%, transparent)' }}
        />
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div
        ref={heroContentRef}
        className="hero-content container-content flex flex-col items-center text-center pt-20 md:pt-0 z-10">

        {/* Glassmorphic Section Label */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 20, filter: prefersReduced ? 'none' : 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: SEQUENCE.label * stagger, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span className={cn(
            "inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full",
            "bg-text-primary/5 backdrop-blur-md border border-text-primary/10 shadow-sm",
            "transition-all hover:bg-text-primary/10"
          )}>
            <Sparkles size={14} className="text-accent-primary" />
            <span className="font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary mt-0.5">
              Personal Reading Archive
            </span>
          </span>
        </motion.div>

        {/* Cinematic Hero Heading */}
        <motion.h1
          id="hero-title"
          className="hero-title-glow mb-6"
          style={{ fontFamily: 'var(--font-hero)' }}
          initial={{ opacity: 0, y: prefersReduced ? 0 : 40, filter: prefersReduced ? 'none' : 'blur(12px)', scale: prefersReduced ? 1 : 0.95 }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
          transition={{ delay: SEQUENCE.title * stagger, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={cn(
            'flex leading-[0.85] tracking-[-0.04em]',
            'text-[clamp(4rem,13vw,10rem)]',
            'flex-col gap-0', // Mobile vertical
            'md:flex-row md:gap-[0.2em] md:items-baseline', // Desktop horizontal
          )}>
            <GradientText className="drop-shadow-sm">Comic</GradientText>
            <span className="text-text-primary drop-shadow-sm">Curated</span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="max-w-2xl font-body text-balance flex flex-col gap-2 mb-10"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 20, filter: prefersReduced ? 'none' : 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: SEQUENCE.subtitle * stagger, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-lg sm:text-xl md:text-2xl font-medium text-text-secondary">
            Korean manhwa · Chinese manhua · Japanese manga
          </span>
          <span className="text-sm sm:text-base font-light text-text-tertiary">
            A cinematic showcase of every title I&apos;ve read, rated, and loved.
          </span>
        </motion.p>

        {/* CTA Actions */}
        <motion.div
          className="relative flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 16, filter: prefersReduced ? 'none' : 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: SEQUENCE.cta * stagger, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle glow behind primary button */}
          <div className="absolute inset-0 -z-10 bg-accent-primary/20 blur-2xl rounded-full scale-110 pointer-events-none" />
          
          <Button size="lg" className="w-full sm:w-auto rounded-full px-8 gap-2 group" asChild>
            <Link href="/library">
              Browse Library
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          
          <Button variant="secondary" size="lg" className="w-full sm:w-auto rounded-full px-8 bg-surface-elevated/30 hover:bg-surface-elevated/60 border-text-primary/10" asChild>
            <Link href="/discover">Discover by Mood</Link>
          </Button>
        </motion.div>

        {/* ── Scroll indicator ───────────────────────────────── */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: SEQUENCE.scroll * stagger, duration: 0.8 }}
          aria-hidden="true"
        >
          {/* Mouse Outline Pill */}
          <div className="w-5 h-8 border-[1.5px] border-text-tertiary rounded-full flex justify-center p-1 opacity-60">
            <motion.div 
              className="w-1 h-1.5 bg-text-secondary rounded-full"
              animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <span className="font-heading text-[9px] font-bold uppercase tracking-[0.25em] text-text-tertiary opacity-70">
            Scroll
          </span>
        </motion.div>
      </div>
    </section>
  );
}