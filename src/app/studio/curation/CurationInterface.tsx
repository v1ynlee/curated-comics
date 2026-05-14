'use client';

// ============================================================
// CurationInterface — Interactive drag-and-drop featured title management
// Client component with:
// - Select/deselect titles as featured
// - Drag-and-drop reordering of featured titles
// - Live preview of homepage featured section
// Requirements: 8.7, 9.4
// ============================================================

import { useState, useCallback, useMemo, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Star, StarOff, Save, Eye, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { TIER_CONFIG } from '@/types/title';
import type { TierLevel } from '@/types/title';
import { CoverImage } from '@/components/ui/CoverImage';
import { saveCuration } from './actions';
import type { CurationTitle } from './page';

// ── Main Interface ──────────────────────────────────────────────

interface CurationInterfaceProps {
  titles: CurationTitle[];
}

export function CurationInterface({ titles: initialTitles }: CurationInterfaceProps) {
  const [allTitles, setAllTitles] = useState<CurationTitle[]>(initialTitles);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showPreview, setShowPreview] = useState(false);

  // Separate featured and available titles
  const featuredTitles = useMemo(
    () =>
      allTitles
        .filter((t) => t.featured)
        .sort((a, b) => a.featured_order - b.featured_order),
    [allTitles],
  );

  const availableTitles = useMemo(() => {
    const nonFeatured = allTitles.filter((t) => !t.featured);
    if (!searchQuery.trim()) return nonFeatured;
    const q = searchQuery.toLowerCase();
    return nonFeatured.filter((t) => t.title_english.toLowerCase().includes(q));
  }, [allTitles, searchQuery]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Handle drag end for reordering
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setAllTitles((prev) => {
        const featured = prev
          .filter((t) => t.featured)
          .sort((a, b) => a.featured_order - b.featured_order);

        const oldIndex = featured.findIndex((t) => t.id === active.id);
        const newIndex = featured.findIndex((t) => t.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return prev;

        const reordered = arrayMove(featured, oldIndex, newIndex);

        // Reassign featured_order based on new positions
        const updatedFeatured = reordered.map((t, i) => ({
          ...t,
          featured_order: i,
        }));

        // Merge back with non-featured titles
        const nonFeatured = prev.filter((t) => !t.featured);
        return [...updatedFeatured, ...nonFeatured];
      });
    },
    [],
  );

  // Toggle featured status
  const toggleFeatured = useCallback((titleId: string) => {
    setAllTitles((prev) => {
      const title = prev.find((t) => t.id === titleId);
      if (!title) return prev;

      if (title.featured) {
        // Remove from featured
        return prev.map((t) =>
          t.id === titleId ? { ...t, featured: false, featured_order: 0 } : t,
        );
      } else {
        // Add to featured at the end
        const maxOrder = Math.max(0, ...prev.filter((t) => t.featured).map((t) => t.featured_order));
        return prev.map((t) =>
          t.id === titleId ? { ...t, featured: true, featured_order: maxOrder + 1 } : t,
        );
      }
    });
  }, []);

  // Save changes
  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    startTransition(async () => {
      // Build updates: all titles that are featured get their order, non-featured get reset
      const updates = allTitles.map((t) => ({
        id: t.id,
        featured: t.featured,
        featured_order: t.featured ? t.featured_order : 0,
      }));

      const result = await saveCuration(updates);
      setSaveStatus(result.success ? 'saved' : 'error');

      // Reset status after delay
      setTimeout(() => setSaveStatus('idle'), 3000);
    });
  }, [allTitles]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return allTitles.some((current) => {
      const original = initialTitles.find((t) => t.id === current.id);
      if (!original) return true;
      return (
        current.featured !== original.featured ||
        current.featured_order !== original.featured_order
      );
    });
  }, [allTitles, initialTitles]);

  return (
    <div className="flex flex-col gap-6">
      {/* Action Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
            'font-heading text-sm font-bold transition-all duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            hasChanges && !isPending
              ? 'bg-accent-primary text-white hover:bg-accent-primary/90'
              : 'bg-white/5 text-text-tertiary cursor-not-allowed',
          )}
          aria-label="Save curation changes"
        >
          <Save size={16} aria-hidden="true" />
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
        </button>

        <button
          onClick={() => setShowPreview((p) => !p)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
            'font-heading text-sm font-bold transition-all duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            showPreview
              ? 'bg-accent-tertiary/20 text-accent-tertiary border border-accent-tertiary/30'
              : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/5',
          )}
          aria-label={showPreview ? 'Hide live preview' : 'Show live preview'}
        >
          <Eye size={16} aria-hidden="true" />
          {showPreview ? 'Hide Preview' : 'Live Preview'}
        </button>

        {saveStatus === 'error' && (
          <span className="font-body text-sm text-semantic-danger">
            Failed to save. Please try again.
          </span>
        )}

        <span className="ml-auto font-data text-xs text-text-tertiary">
          {featuredTitles.length} featured
        </span>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <LivePreview titles={featuredTitles} />
      )}

      {/* Two-column layout: Featured (left) + Available (right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Featured Titles — Drag-and-drop sortable */}
        <section aria-labelledby="featured-heading">
          <h2
            id="featured-heading"
            className="font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary mb-3"
          >
            Featured Titles (Drag to Reorder)
          </h2>

          {featuredTitles.length === 0 ? (
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-3 py-16 rounded-lg',
                'bg-bg-surface/30 border border-dashed border-white/10',
              )}
            >
              <Star size={24} className="text-text-tertiary" aria-hidden="true" />
              <p className="font-body text-sm text-text-secondary text-center max-w-xs">
                No featured titles yet. Select titles from the available list to feature them on the homepage.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={featuredTitles.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul role="list" className="flex flex-col gap-2" aria-label="Featured titles, drag to reorder">
                  {featuredTitles.map((title, index) => (
                    <SortableFeaturedItem
                      key={title.id}
                      title={title}
                      index={index}
                      onRemove={() => toggleFeatured(title.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>

        {/* Available Titles — Select to feature */}
        <section aria-labelledby="available-heading">
          <h2
            id="available-heading"
            className="font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary mb-3"
          >
            Available Titles
          </h2>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-8 pr-4 py-2 rounded-lg',
                'bg-bg-deep/60 border border-white/10',
                'font-body text-sm text-text-primary placeholder:text-text-tertiary',
                'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
                'transition-colors duration-150',
              )}
              aria-label="Search available titles"
            />
          </div>

          {/* Available list */}
          <div
            className={cn(
              'flex flex-col gap-1.5 max-h-[600px] overflow-y-auto rounded-lg',
              'bg-bg-surface/20 border border-white/5 p-2',
            )}
          >
            {availableTitles.length === 0 ? (
              <p className="font-body text-sm text-text-tertiary text-center py-8">
                {searchQuery ? 'No titles match your search.' : 'All titles are featured.'}
              </p>
            ) : (
              availableTitles.map((title) => (
                <AvailableTitleItem
                  key={title.id}
                  title={title}
                  onAdd={() => toggleFeatured(title.id)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Sortable Featured Item ──────────────────────────────────────

function SortableFeaturedItem({
  title,
  index,
  onRemove,
}: {
  title: CurationTitle;
  index: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: title.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const tierConfig = title.tier ? TIER_CONFIG[title.tier as TierLevel] : null;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg',
        'bg-bg-surface/50 border border-white/5',
        'transition-all duration-150',
        isDragging && 'opacity-50 shadow-lg shadow-accent-primary/10 border-accent-primary/30 z-10',
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-6 h-6 rounded text-text-tertiary hover:text-text-primary cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-accent-primary"
        aria-label={`Drag to reorder ${title.title_english}`}
      >
        <GripVertical size={16} />
      </button>

      {/* Order number */}
      <span className="font-data text-xs text-text-tertiary w-5 text-center shrink-0">
        {index + 1}
      </span>

      {/* Cover thumbnail */}
      <div className="w-8 h-11 shrink-0 rounded overflow-hidden">
        <CoverImage
          slug={title.cover_slug ?? title.slug}
          alt={title.title_english}
          origin={title.origin}
          dominantColor={title.dominant_color ?? '#1a1a2e'}
          rounded={false}
          sizes="32px"
        />
      </div>

      {/* Title info */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-body text-sm text-text-primary truncate">
          {title.title_english}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-heading text-[9px] uppercase tracking-wider text-text-tertiary">
            {title.origin}
          </span>
          {tierConfig && (
            <span
              className="font-heading text-[9px] font-bold px-1 py-0.5 rounded-sm leading-none"
              style={{
                color: tierConfig.color,
                backgroundColor: `${tierConfig.color}20`,
              }}
            >
              {title.tier}
            </span>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded-md shrink-0',
          'text-accent-secondary hover:bg-accent-secondary/10',
          'transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-accent-primary',
        )}
        aria-label={`Remove ${title.title_english} from featured`}
      >
        <StarOff size={14} />
      </button>
    </li>
  );
}

// ── Available Title Item ────────────────────────────────────────

function AvailableTitleItem({
  title,
  onAdd,
}: {
  title: CurationTitle;
  onAdd: () => void;
}) {
  const tierConfig = title.tier ? TIER_CONFIG[title.tier as TierLevel] : null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg',
        'hover:bg-bg-surface/40 transition-colors duration-150',
      )}
    >
      {/* Cover thumbnail */}
      <div className="w-7 h-10 shrink-0 rounded overflow-hidden">
        <CoverImage
          slug={title.cover_slug ?? title.slug}
          alt={title.title_english}
          origin={title.origin}
          dominantColor={title.dominant_color ?? '#1a1a2e'}
          rounded={false}
          sizes="28px"
        />
      </div>

      {/* Title info */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-body text-sm text-text-primary truncate">
          {title.title_english}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-heading text-[9px] uppercase tracking-wider text-text-tertiary">
            {title.origin}
          </span>
          {tierConfig && (
            <span
              className="font-heading text-[9px] font-bold px-1 py-0.5 rounded-sm leading-none"
              style={{
                color: tierConfig.color,
                backgroundColor: `${tierConfig.color}20`,
              }}
            >
              {title.tier}
            </span>
          )}
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={onAdd}
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded-md shrink-0',
          'text-text-tertiary hover:text-accent-secondary hover:bg-accent-secondary/10',
          'transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-accent-primary',
        )}
        aria-label={`Add ${title.title_english} to featured`}
      >
        <Star size={14} />
      </button>
    </div>
  );
}

// ── Live Preview ────────────────────────────────────────────────

function LivePreview({ titles }: { titles: CurationTitle[] }) {
  const displayTitles = titles.slice(0, 6);

  return (
    <section
      aria-labelledby="preview-heading"
      className={cn(
        'rounded-xl p-6 border border-accent-tertiary/20',
        'bg-bg-deep/80 backdrop-blur-sm',
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Eye size={14} className="text-accent-tertiary" aria-hidden="true" />
        <h3
          id="preview-heading"
          className="font-heading text-[10px] uppercase tracking-[0.2em] text-accent-tertiary"
        >
          Homepage Preview
        </h3>
      </div>

      {/* Simulated homepage featured section */}
      <div className="flex flex-col gap-4">
        {/* Section header preview */}
        <div className="flex flex-col gap-1">
          <span className="font-heading text-[9px] uppercase tracking-[0.25em] text-text-tertiary">
            Handpicked
          </span>
          <h4 className="font-display text-xl font-bold text-text-primary">
            Featured Titles
          </h4>
          <p className="font-body text-xs text-text-secondary">
            The ones that left a mark. Rated, reviewed, and worth your time.
          </p>
        </div>

        {/* Grid preview */}
        {displayTitles.length === 0 ? (
          <div className="flex items-center justify-center py-12 rounded-lg border border-dashed border-white/10">
            <p className="font-body text-sm text-text-tertiary">
              No featured titles to preview
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {displayTitles.map((title) => (
              <PreviewCard key={title.id} title={title} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Preview Card ────────────────────────────────────────────────

function PreviewCard({ title }: { title: CurationTitle }) {
  const tierConfig = title.tier ? TIER_CONFIG[title.tier as TierLevel] : null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative overflow-hidden rounded-lg">
        <CoverImage
          slug={title.cover_slug ?? title.slug}
          alt={title.title_english}
          origin={title.origin}
          tier={title.tier as TierLevel | undefined}
          dominantColor={title.dominant_color ?? '#1a1a2e'}
          rounded
          sizes="(max-width: 768px) 33vw, 16vw"
        />
      </div>
      <div className="flex flex-col gap-0.5 px-0.5">
        <span className="font-body text-[11px] font-medium text-text-primary leading-tight line-clamp-2">
          {title.title_english}
        </span>
        <span className="font-heading text-[8px] uppercase tracking-widest text-text-tertiary">
          {title.origin}
        </span>
      </div>
    </div>
  );
}
