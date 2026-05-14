'use client';

// ============================================================
// GalleryTab — image collections grouped by context
// Lazy-loads images with skeleton placeholders.
// Click a group → grid view of that group's images.
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Heart, Laugh, Image as ImageIcon,
  ArrowLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTitleGallery } from '@/hooks/useTitleContent';
import type { GalleryImage } from '@/services/titleContent';

const CATEGORY_CONFIG = {
  'best-scene':     { label: 'Best Scenes',     icon: Sparkles, color: '#8b5cf6' },
  'romantic-scene': { label: 'Romantic Scenes', icon: Heart,    color: '#ec4899' },
  'funny-scene':    { label: 'Funny Scenes',    icon: Laugh,    color: '#f59e0b' },
  'general':        { label: 'General',         icon: ImageIcon, color: '#06b6d4' },
  'cover':          { label: 'Covers',          icon: ImageIcon, color: '#10b981' },
} as const;

// ── Lazy image with skeleton ──────────────────────────────────

function LazyImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-surface-elevated/50', className)}>
      {/* Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 animate-shimmer" aria-hidden="true" />
      )}
      {/* Image — only renders when in viewport via loading="lazy" */}
      {!error && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={20} className="text-text-tertiary" />
        </div>
      )}
    </div>
  );
}

// ── Group card (shows 3 preview thumbnails) ───────────────────

function GroupCard({
  category,
  images,
  onClick,
}: {
  category: keyof typeof CATEGORY_CONFIG;
  images: GalleryImage[];
  onClick: () => void;
}) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  const previews = images.slice(0, 3);

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex flex-col gap-3 p-3 rounded-xl text-left w-full',
        'bg-surface-elevated/30 border border-white/5',
        'hover:border-white/10 hover:bg-surface-elevated/50',
        'transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
      )}
    >
      {/* Preview thumbnails */}
      <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden aspect-[3/1.4]">
        {previews.map((img, i) => (
          <LazyImage
            key={img.id}
            src={img.imageUrl}
            alt={img.caption ?? `${config.label} ${i + 1}`}
            className="aspect-[2/3]"
          />
        ))}
        {/* Fill empty slots */}
        {Array.from({ length: Math.max(0, 3 - previews.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-[2/3] bg-surface-elevated/30" />
        ))}
      </div>

      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: config.color }} aria-hidden="true" />
          <span className="font-heading text-xs font-medium text-text-primary">
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-data text-[10px] text-text-tertiary">{images.length}</span>
          <ChevronRight size={12} className="text-text-tertiary" aria-hidden="true" />
        </div>
      </div>
    </motion.button>
  );
}

// ── Image grid view (after clicking a group) ─────────────────

function ImageGrid({
  category,
  images,
  onBack,
}: {
  category: keyof typeof CATEGORY_CONFIG;
  images: GalleryImage[];
  onBack: () => void;
}) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0] }}
    >
      {/* Back header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className={cn(
            'flex items-center gap-1.5 text-text-tertiary hover:text-text-primary',
            'transition-colors duration-150',
            'focus-visible:outline-accent-primary rounded-sm',
          )}
          aria-label="Back to gallery"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span className="font-heading text-xs uppercase tracking-widest">Back</span>
        </button>
        <div className="flex items-center gap-2 ml-2">
          <Icon size={14} style={{ color: config.color }} aria-hidden="true" />
          <span className="font-heading text-xs font-medium text-text-primary">
            {config.label}
          </span>
          <span className="font-data text-[10px] text-text-tertiary">({images.length})</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.map((img) => (
          <div key={img.id} className="flex flex-col gap-1">
            <LazyImage
              src={img.imageUrl}
              alt={img.caption ?? config.label}
              className="aspect-[2/3] rounded-lg"
            />
            {img.caption && (
              <p className="font-body text-[10px] text-text-tertiary line-clamp-1 px-0.5">
                {img.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main GalleryTab ───────────────────────────────────────────

export function GalleryTab({ titleId }: { titleId: string }) {
  const { data: images, isLoading } = useTitleGallery(titleId);
  const [activeCategory, setActiveCategory] = useState<keyof typeof CATEGORY_CONFIG | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="text-text-tertiary animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <ImageIcon size={36} className="text-text-tertiary" aria-hidden="true" />
        <p className="font-body text-sm text-text-secondary">No gallery images yet.</p>
      </div>
    );
  }

  // Group by category
  const grouped = images.reduce<Record<string, GalleryImage[]>>((acc, img) => {
    if (!acc[img.category]) acc[img.category] = [];
    acc[img.category].push(img);
    return acc;
  }, {});

  const activeImages = activeCategory ? grouped[activeCategory] ?? [] : [];

  return (
    <div className="py-4">
      <AnimatePresence mode="wait">
        {activeCategory ? (
          <ImageGrid
            key="grid"
            category={activeCategory}
            images={activeImages}
            onBack={() => setActiveCategory(null)}
          />
        ) : (
          <motion.div
            key="groups"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {(Object.keys(grouped) as (keyof typeof CATEGORY_CONFIG)[]).map((cat) => (
              <GroupCard
                key={cat}
                category={cat}
                images={grouped[cat]}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
