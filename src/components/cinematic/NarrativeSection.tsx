'use client';

// ============================================================
// NarrativeSection — scroll-driven cinematic discovery section
// Each section is a full-viewport "scene" with atmospheric
// cover imagery, parallax depth, and a mood-driven CTA.
// ============================================================

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils/cn';

export interface NarrativeSectionProps {
  /** Section heading */
  heading: string;
  /** Descriptive subtitle */
  subtitle: string;
  /** CTA button text */
  ctaText: string;
  /** Link destination (e.g. /discover?mood=wholesome) */
  ctaHref: string;
  /** Cover image slugs for the atmospheric background (3-5 recommended) */
  coverSlugs: string[];
  /** Atmospheric accent color for the section (oklch or hex) */
  accentColor: string;
  /** Section index for stagger and unique keys */
  index: number;
  /** Optional className */
  className?: string;
}

export function NarrativeSection({
  heading,
  subtitle,
  ctaText,
  ctaHref,
  coverSlugs,
  accentColor,
  index,
  className,
}: NarrativeSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Parallax transforms for depth layers
  const bgY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [60, -60]);
  const fgY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [30, -30]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 0.5, 0.5, 0.8]);

  // Alternate layout direction for visual rhythm
  const isReversed = index % 2 === 1;

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative min-h-[85vh] flex items-center overflow-hidden',
        className,
      )}
      aria-labelledby={`narrative-heading-${index}`}
    >
      {/* ── Atmospheric background layer — parallax cover collage ── */}
      <motion.div
        className="absolute inset-0 -z-20"
        style={{ y: bgY }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 grid grid-cols-3 gap-1 opacity-30">
          {coverSlugs.slice(0, 3).map((slug, i) => (
            <div
              key={slug}
              className="relative overflow-hidden"
              style={{
                transform: `scale(1.1) translateY(${i * 10}px)`,
              }}
            >
              <Image
                src={`/images/covers/${slug}-640w.avif`}
                alt=""
                fill
                className="object-cover"
                sizes="33vw"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Deep blur over the collage for atmosphere */}
        <div className="absolute inset-0 backdrop-blur-[40px]" />
      </motion.div>

      {/* ── Color atmosphere overlay ── */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at ${isReversed ? '30%' : '70%'} 50%, ${accentColor}20 0%, transparent 60%), linear-gradient(to bottom, var(--color-bg-deep) 0%, transparent 20%, transparent 80%, var(--color-bg-deep) 100%)`,
          }}
        />
      </motion.div>

      {/* ── Foreground content ── */}
      <motion.div
        className={cn(
          'container-content relative z-10 grid gap-8 items-center py-24',
          'md:grid-cols-[1fr_1.2fr]',
          isReversed && 'md:grid-cols-[1.2fr_1fr]',
        )}
        style={{ y: fgY }}
      >
        {/* Text content */}
        <motion.div
          className={cn(
            'flex flex-col gap-5',
            isReversed && 'md:order-2',
          )}
          initial={{ opacity: 0, x: prefersReduced ? 0 : (isReversed ? 40 : -40), filter: prefersReduced ? 'none' : 'blur(8px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            id={`narrative-heading-${index}`}
            className="font-display text-[clamp(1.75rem,4vw,3rem)] font-bold text-text-primary leading-[1.1]"
          >
            {heading}
          </h2>
          <p className="font-body text-text-secondary text-base md:text-lg max-w-md leading-relaxed">
            {subtitle}
          </p>
          <div className="mt-2">
            <Button size="lg" asChild>
              <Link href={ctaHref}>{ctaText}</Link>
            </Button>
          </div>
        </motion.div>

        {/* Cover art showcase — stacked, tilted cards with depth */}
        <motion.div
          className={cn(
            'relative h-[400px] md:h-[500px]',
            isReversed && 'md:order-1',
          )}
          initial={{ opacity: 0, x: prefersReduced ? 0 : (isReversed ? -40 : 40), filter: prefersReduced ? 'none' : 'blur(6px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          {coverSlugs.slice(0, 4).map((slug, i) => {
            const rotations = [-6, 3, -2, 5];
            const offsets = [
              { x: '5%', y: '8%' },
              { x: '25%', y: '2%' },
              { x: '45%', y: '12%' },
              { x: '15%', y: '35%' },
            ];
            const scales = [0.85, 0.9, 0.88, 0.82];

            return (
              <motion.div
                key={slug}
                className="absolute rounded-lg overflow-hidden shadow-2xl shadow-black/40"
                style={{
                  width: 'clamp(140px, 30%, 200px)',
                  aspectRatio: '2/3',
                  left: offsets[i]?.x ?? '0%',
                  top: offsets[i]?.y ?? '0%',
                  rotate: rotations[i] ?? 0,
                  scale: scales[i] ?? 0.85,
                  zIndex: coverSlugs.length - i,
                }}
                initial={{ opacity: 0, y: prefersReduced ? 0 : 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{
                  delay: 0.2 + i * 0.1,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Image
                  src={`/images/covers/${slug}-640w.avif`}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="200px"
                  loading="lazy"
                />
                {/* Subtle glow border */}
                <div
                  className="absolute inset-0 rounded-lg ring-1 ring-white/10"
                  style={{
                    boxShadow: `0 0 20px ${accentColor}30, inset 0 1px 0 rgba(255,255,255,0.08)`,
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* ── Section transition edge — gradient fade to next section ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--color-bg-deep))',
        }}
        aria-hidden="true"
      />
    </section>
  );
}
