'use client';

// ============================================================
// VibeGrid — Browse by Vibe layout
//
// Desktop: horizontal scroll with:
//   1. Body scroll lock on mouseenter (guaranteed vertical lock)
//   2. RAF momentum scrolling (smooth, cinematic feel)
//   3. deltaMode normalization (mouse wheel vs trackpad)
//   4. items-stretch + h-full for uniform card heights
//
// Mobile: vertical single-column
// ============================================================

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { useVibeDiscovery } from '@/hooks/useVibeDiscovery';
import type { VibeSortOption } from '@/hooks/useVibeDiscovery';
import { VibeCard } from './VibeCard';
import { VibeControlBar } from './VibeControlBar';
import { VibeGridSkeleton } from './VibeSkeleton';

// ─────────────────────────────────────────────────────────────────
// HorizontalScrollTrack
//
// Own component so useEffect([]) runs AFTER this element exists in
// the DOM (VibeGrid renders skeleton first, so a top-level effect
// would find null ref and never re-run).
//
// SCROLL STRATEGY — 3 layers:
//
//   Layer 1 — Body scroll lock
//     On mouseenter: document.body.style.overflowY = 'hidden'
//     On mouseleave: restore it
//     This is the nuclear option — guarantees the page CANNOT scroll
//     vertically while the cursor is inside the track. No amount of
//     event propagation or framework interference can bypass this.
//
//   Layer 2 — Wheel event interception (non-passive)
//     Attach { passive: false } so e.preventDefault() is honoured.
//     React's synthetic onWheel is always passive → no-op. We need
//     a native listener.
//     deltaMode normalization: mice send LINE mode (×40px), trackpads
//     send PIXEL mode (raw px). We convert to consistent px.
//
//   Layer 3 — RAF momentum scrolling
//     Instead of `scrollLeft += delta` (instant, jittery), we add
//     delta to a velocity, then decay it each frame with friction.
//     Result: smooth, cinematic deceleration (60fps).
// ─────────────────────────────────────────────────────────────────

interface ScrollTrackProps {
  children: React.ReactNode;
  onScrollReset?: (fn: () => void) => void;
  className?: string;
}

function HorizontalScrollTrack({ children, onScrollReset, className }: ScrollTrackProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ── Layer 1: body scroll lock ──────────────────────────────
    const lockScroll = () => {
      document.body.style.overflowY = 'hidden';
    };
    const unlockScroll = () => {
      document.body.style.overflowY = '';
    };
    el.addEventListener('mouseenter', lockScroll);
    el.addEventListener('mouseleave', unlockScroll);

    // ── Layer 2 + 3: wheel → momentum horizontal scroll ────────
    let velocity = 0;
    let rafId    = 0;

    // Momentum decay loop — runs on RAF until velocity is negligible
    const step = () => {
      velocity *= 0.88; // friction: 0.88 ≈ 200ms to stop at 60fps
      el.scrollLeft += velocity;
      if (Math.abs(velocity) > 0.5) {
        rafId = requestAnimationFrame(step);
      } else {
        velocity = 0;
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Trackpad horizontal swipe (deltaX dominant) → let browser handle
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      e.preventDefault(); // works because listener is non-passive
      e.stopPropagation(); // belt-and-suspenders: don't let parents see it

      // Normalize deltaMode so mice and trackpads feel consistent
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;  // LINE mode (most scroll mice)
      if (e.deltaMode === 2) delta *= el.clientWidth; // PAGE mode (rare)

      // Add to velocity — accumulation gives momentum on rapid scrolling
      velocity += delta * 0.7;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(step);
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('mouseenter', lockScroll);
      el.removeEventListener('mouseleave', unlockScroll);
      el.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(rafId);
      // Safety: always restore body scroll on unmount
      document.body.style.overflowY = '';
    };
  }, []); // safe: only runs when this component mounts (data already loaded)

  // Expose scroll-to-start for parent (triggered on sort change)
  useEffect(() => {
    if (!onScrollReset) return;
    onScrollReset(() => {
      ref.current?.scrollTo({ left: 0, behavior: 'smooth' });
    });
  }, [onScrollReset]);

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-row gap-4',
        // items-stretch: all child divs fill the row height (tallest card)
        'items-stretch',
        'overflow-x-auto overflow-y-hidden',
        'scrollbar-none',
        // Extra padding so box-shadow glow isn't clipped by overflow:hidden
        'px-2 py-4 -my-4',
        className,
      )}
      style={{
        overscrollBehaviorX: 'contain',
        // Edge fade
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)',
      }}
    >
      {children}
    </div>
  );
}

// ── VibeGrid ─────────────────────────────────────────────────────

interface VibeGridProps {
  className?: string;
}

export function VibeGrid({ className }: VibeGridProps) {
  const [sortBy, setSortBy]           = useState<VibeSortOption>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortTransition, setSortTransition] = useState(false);

  const scrollResetRef = useRef<(() => void) | null>(null);
  const registerScrollReset = useCallback((fn: () => void) => {
    scrollResetRef.current = fn;
  }, []);

  const { data: moods, isLoading, isError } = useVibeDiscovery(sortBy);

  const filtered = useMemo(() => {
    if (!moods) return [];
    if (!searchQuery.trim()) return moods;
    const q = searchQuery.toLowerCase();
    return moods.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.editorNote?.toLowerCase().includes(q),
    );
  }, [moods, searchQuery]);

  const handleSortChange = useCallback((sort: VibeSortOption) => {
    setSortTransition(true);
    setSortBy(sort);
    scrollResetRef.current?.();
    setTimeout(() => setSortTransition(false), 220);
  }, []);

  const totalTitles = useMemo(
    () => moods?.reduce((sum, m) => sum + m.titleCount, 0) ?? 0,
    [moods],
  );

  if (isLoading) return <VibeGridSkeleton className={className} />;

  if (isError) {
    return (
      <div className={cn('state-error text-sm py-8', className)}>
        Failed to load vibes. Please refresh the page.
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <VibeControlBar
        totalVibes={filtered.length}
        totalTitles={totalTitles}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {filtered.length === 0 && (
        <div className="state-empty text-text-muted text-sm py-16">
          No vibes match &ldquo;{searchQuery}&rdquo;
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/* ── Desktop: horizontal scroll ─────────────────────── */}
          <div
            className={cn(
              'hidden sm:block',
              'transition-opacity duration-200',
              sortTransition && 'opacity-0',
            )}
          >
            <HorizontalScrollTrack onScrollReset={registerScrollReset}>
              {filtered.map((mood, index) => (
              // Card has explicit fixed height — h-full wrapper no longer needed
                <div key={mood.id} className="flex-shrink-0">
                  <VibeCard mood={mood} index={index} />
                </div>
              ))}
            </HorizontalScrollTrack>
          </div>

          {/* ── Mobile: vertical stack ─────────────────────────── */}
          <div
            className={cn(
              'flex sm:hidden flex-col gap-4',
              'transition-opacity duration-200',
              sortTransition && 'opacity-0',
            )}
          >
            {filtered.map((mood, index) => (
              <div key={mood.id} className="w-full vibe-card-mobile-full">
                <VibeCard mood={mood} index={index} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
