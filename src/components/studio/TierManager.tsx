'use client';

// ============================================================
// TierManager — Drag-and-drop tier assignment for Studio CMS
// Visual columns for each tier (SSS+, S, A, B, C, D, F)
// Title cards with cover thumbnails, uses @dnd-kit for accessible DnD
// Requirements: 8.3
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/cn';
import { TIER_CONFIG } from '@/types/title';
import type { AdminTitleRow, TierLevel } from '@/types/studio';

// ── Props ─────────────────────────────────────────────────────

interface TierManagerProps {
  titles: AdminTitleRow[];
  onTierChange: (titleId: string, newTier: TierLevel) => Promise<void>;
}

// ── Constants ─────────────────────────────────────────────────

const TIER_LEVELS: TierLevel[] = ['SSS+', 'S', 'A', 'B', 'C', 'D', 'F'];

// ── Sortable Title Card ───────────────────────────────────────

interface SortableTitleCardProps {
  title: AdminTitleRow;
}

function SortableTitleCard({ title }: SortableTitleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: title.id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'flex items-center gap-2.5 p-2 rounded-lg cursor-grab active:cursor-grabbing',
        'bg-bg-deep/60 border border-white/10',
        'hover:border-white/20 hover:bg-bg-deep/80',
        'transition-colors duration-150',
        isDragging && 'shadow-lg shadow-black/40',
      )}
      aria-label={`${title.englishTitle} — drag to change tier`}
    >
      {/* Cover thumbnail */}
      {title.coverUrl ? (
        <img
          src={title.coverUrl}
          alt=""
          className="w-8 h-11 rounded object-cover shrink-0 bg-bg-surface/60"
        />
      ) : (
        <div className="w-8 h-11 rounded bg-bg-surface/60 border border-white/5 shrink-0 flex items-center justify-center">
          <span className="text-text-tertiary text-[8px]">N/A</span>
        </div>
      )}

      {/* Title name */}
      <span className="text-xs text-text-primary font-body truncate">
        {title.englishTitle}
      </span>
    </div>
  );
}

// ── Drag Overlay Card (ghost while dragging) ──────────────────

function DragOverlayCard({ title }: { title: AdminTitleRow }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 p-2 rounded-lg',
        'bg-bg-surface/90 border border-accent-primary/50',
        'shadow-xl shadow-black/50',
      )}
    >
      {title.coverUrl ? (
        <img
          src={title.coverUrl}
          alt=""
          className="w-8 h-11 rounded object-cover shrink-0"
        />
      ) : (
        <div className="w-8 h-11 rounded bg-bg-surface/60 border border-white/5 shrink-0 flex items-center justify-center">
          <span className="text-text-tertiary text-[8px]">N/A</span>
        </div>
      )}
      <span className="text-xs text-text-primary font-body truncate">
        {title.englishTitle}
      </span>
    </div>
  );
}

// ── Tier Column (droppable) ───────────────────────────────────

interface TierColumnProps {
  tier: TierLevel;
  titles: AdminTitleRow[];
  isOver: boolean;
}

function TierColumn({ tier, titles, isOver }: TierColumnProps) {
  const config = TIER_CONFIG[tier];

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl overflow-hidden',
        'bg-bg-surface/30 border border-white/5',
        'transition-all duration-200',
        isOver && 'border-accent-primary/40 bg-bg-surface/50 scale-[1.01]',
      )}
    >
      {/* Tier header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5"
        style={{ borderTopColor: config.color, borderTopWidth: '3px' }}
      >
        <span
          className="font-heading text-sm font-bold"
          style={{ color: config.color }}
        >
          {tier}
        </span>
        <span className="text-text-tertiary text-[10px] font-body">
          {config.label}
        </span>
        <span className="ml-auto text-text-tertiary text-[10px] font-body tabular-nums">
          {titles.length}
        </span>
      </div>

      {/* Sortable title list */}
      <div className="flex flex-col gap-1.5 p-2 min-h-[80px] flex-1">
        <SortableContext
          items={titles.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {titles.map((title) => (
            <SortableTitleCard key={title.id} title={title} />
          ))}
        </SortableContext>

        {titles.length === 0 && (
          <div className="flex items-center justify-center flex-1 py-4">
            <span className="text-text-tertiary text-[10px] italic">
              Drop titles here
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export function TierManager({ titles, onTierChange }: TierManagerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [localTitles, setLocalTitles] = useState<AdminTitleRow[]>(titles);

  // Group titles by tier
  const titlesByTier = useMemo(() => {
    const grouped: Record<TierLevel, AdminTitleRow[]> = {
      'SSS+': [],
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
      F: [],
    };
    for (const title of localTitles) {
      if (grouped[title.tier]) {
        grouped[title.tier].push(title);
      }
    }
    return grouped;
  }, [localTitles]);

  // Find which tier a title belongs to
  const findTierForTitle = useCallback(
    (titleId: string): TierLevel | null => {
      for (const tier of TIER_LEVELS) {
        if (titlesByTier[tier].some((t) => t.id === titleId)) {
          return tier;
        }
      }
      return null;
    },
    [titlesByTier],
  );

  // Determine which tier a droppable ID belongs to
  // IDs can be either a title ID (within a tier) or a tier-level string
  const resolveTier = useCallback(
    (id: string): TierLevel | null => {
      // Check if the id is a tier level itself (used as container id)
      if (TIER_LEVELS.includes(id as TierLevel)) {
        return id as TierLevel;
      }
      // Otherwise it's a title id — find its tier
      return findTierForTitle(id);
    },
    [findTierForTitle],
  );

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  // Active title for overlay
  const activeTitle = useMemo(
    () => localTitles.find((t) => t.id === activeId) ?? null,
    [localTitles, activeId],
  );

  // Determine which tier column is being hovered
  const overTier = useMemo(() => {
    if (!overId) return null;
    return resolveTier(overId);
  }, [overId, resolveTier]);

  // ── Drag handlers ──────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? (over.id as string) : null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setOverId(null);

      if (!over) return;

      const titleId = active.id as string;
      const sourceTier = findTierForTitle(titleId);
      const targetTier = resolveTier(over.id as string);

      if (!sourceTier || !targetTier || sourceTier === targetTier) return;

      // Optimistic update
      setLocalTitles((prev) =>
        prev.map((t) =>
          t.id === titleId ? { ...t, tier: targetTier } : t,
        ),
      );

      // Persist change
      try {
        await onTierChange(titleId, targetTier);
      } catch {
        // Revert on failure
        setLocalTitles((prev) =>
          prev.map((t) =>
            t.id === titleId ? { ...t, tier: sourceTier } : t,
          ),
        );
      }
    },
    [findTierForTitle, resolveTier, onTierChange],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  // ── Render ─────────────────────────────────────────────────

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* Horizontal scroll on mobile, responsive grid on desktop */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 md:overflow-x-visible md:mx-0 md:px-0">
        <div className="flex gap-3 min-w-max md:min-w-0 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {TIER_LEVELS.map((tier) => (
            <div key={tier} className="w-48 shrink-0 md:w-auto md:shrink">
              <DroppableTierColumn
                tier={tier}
                titles={titlesByTier[tier]}
                isOver={overTier === tier}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Drag overlay — renders outside columns for smooth animation */}
      <DragOverlay dropAnimation={null}>
        {activeTitle ? <DragOverlayCard title={activeTitle} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// ── Droppable Tier Column Wrapper ─────────────────────────────
// Wraps TierColumn with useDroppable so empty columns accept drops

interface DroppableTierColumnProps {
  tier: TierLevel;
  titles: AdminTitleRow[];
  isOver: boolean;
}

function DroppableTierColumn({ tier, titles, isOver }: DroppableTierColumnProps) {
  const { setNodeRef, isOver: droppableIsOver } = useDroppable({
    id: tier,
  });

  return (
    <div ref={setNodeRef}>
      <TierColumn tier={tier} titles={titles} isOver={isOver || droppableIsOver} />
    </div>
  );
}
