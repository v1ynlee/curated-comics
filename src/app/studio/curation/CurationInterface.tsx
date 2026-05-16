'use client';

// ============================================================
// CurationInterface — Interactive curation management
// Client component with tabs for:
// - Featured titles (drag-and-drop reordering)
// - Curated collections (by-artist, by-author, recommended, featured)
// - Mood/theme curations
// Requirements: 8.7, 9.4, 18.1, 18.2, 18.3, 18.4, 18.5
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
import {
  GripVertical,
  Star,
  StarOff,
  Save,
  Eye,
  Search,
  Plus,
  Trash2,
  X,
  FolderOpen,
  Sparkles,
  Users,
  Palette,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TIER_CONFIG } from '@/types/title';
import type { TierLevel } from '@/types/title';
import { CoverImage } from '@/components/ui/CoverImage';
import {
  saveCuration,
  createCollection,
  deleteCollection,
  addTitleToCollection,
  removeTitleFromCollection,
  createMoodCuration,
  deleteMoodCuration,
  addTitleToMoodCuration,
  removeTitleFromMoodCuration,
  type CollectionCategory,
} from './actions';
import type {
  CurationTitle,
  CuratedCollectionWithTitles,
  MoodCurationWithTitles,
} from './page';

// ── Tab Types ───────────────────────────────────────────────────

type CurationTab = 'featured' | 'collections' | 'moods';

// ── Main Interface ──────────────────────────────────────────────

interface CurationInterfaceProps {
  titles: CurationTitle[];
  collections: CuratedCollectionWithTitles[];
  moodCurations: MoodCurationWithTitles[];
}

export function CurationInterface({
  titles: initialTitles,
  collections: initialCollections,
  moodCurations: initialMoodCurations,
}: CurationInterfaceProps) {
  const [activeTab, setActiveTab] = useState<CurationTab>('featured');

  const tabs: { id: CurationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'featured', label: 'Featured', icon: <Star size={14} /> },
    { id: 'collections', label: 'Collections', icon: <FolderOpen size={14} /> },
    { id: 'moods', label: 'Mood / Theme', icon: <Sparkles size={14} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation */}
      <nav className="flex items-center gap-1 border-b border-white/10 pb-0" aria-label="Curation sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 -mb-px',
              'font-heading text-sm font-medium transition-all duration-150',
              'border-b-2 rounded-t-md',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              activeTab === tab.id
                ? 'border-accent-primary text-accent-primary bg-accent-primary/5'
                : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-white/20',
            )}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      {activeTab === 'featured' && (
        <FeaturedTab titles={initialTitles} />
      )}
      {activeTab === 'collections' && (
        <CollectionsTab
          collections={initialCollections}
          allTitles={initialTitles}
        />
      )}
      {activeTab === 'moods' && (
        <MoodCurationsTab
          moodCurations={initialMoodCurations}
          allTitles={initialTitles}
        />
      )}
    </div>
  );
}


// ── Featured Tab ────────────────────────────────────────────────

function FeaturedTab({ titles: initialTitles }: { titles: CurationTitle[] }) {
  const [allTitles, setAllTitles] = useState<CurationTitle[]>(initialTitles);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showPreview, setShowPreview] = useState(false);

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
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
      const updatedFeatured = reordered.map((t, i) => ({ ...t, featured_order: i }));
      const nonFeatured = prev.filter((t) => !t.featured);
      return [...updatedFeatured, ...nonFeatured];
    });
  }, []);

  const toggleFeatured = useCallback((titleId: string) => {
    setAllTitles((prev) => {
      const title = prev.find((t) => t.id === titleId);
      if (!title) return prev;

      if (title.featured) {
        return prev.map((t) =>
          t.id === titleId ? { ...t, featured: false, featured_order: 0 } : t,
        );
      } else {
        const maxOrder = Math.max(0, ...prev.filter((t) => t.featured).map((t) => t.featured_order));
        return prev.map((t) =>
          t.id === titleId ? { ...t, featured: true, featured_order: maxOrder + 1 } : t,
        );
      }
    });
  }, []);

  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    startTransition(async () => {
      const updates = allTitles.map((t) => ({
        id: t.id,
        featured: t.featured,
        featured_order: t.featured ? t.featured_order : 0,
      }));

      const result = await saveCuration(updates);
      setSaveStatus(result.success ? 'saved' : 'error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    });
  }, [allTitles]);

  const hasChanges = useMemo(() => {
    return allTitles.some((current) => {
      const original = initialTitles.find((t) => t.id === current.id);
      if (!original) return true;
      return current.featured !== original.featured || current.featured_order !== original.featured_order;
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
      {showPreview && <LivePreview titles={featuredTitles} />}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Featured Titles */}
        <section aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary mb-3">
            Featured Titles (Drag to Reorder)
          </h2>

          {featuredTitles.length === 0 ? (
            <div className={cn('flex flex-col items-center justify-center gap-3 py-16 rounded-lg', 'bg-bg-surface/30 border border-dashed border-white/10')}>
              <Star size={24} className="text-text-tertiary" aria-hidden="true" />
              <p className="font-body text-sm text-text-secondary text-center max-w-xs">
                No featured titles yet. Select titles from the available list to feature them on the homepage.
              </p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={featuredTitles.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <ul role="list" className="flex flex-col gap-2" aria-label="Featured titles, drag to reorder">
                  {featuredTitles.map((title, index) => (
                    <SortableFeaturedItem key={title.id} title={title} index={index} onRemove={() => toggleFeatured(title.id)} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>

        {/* Available Titles */}
        <section aria-labelledby="available-heading">
          <h2 id="available-heading" className="font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary mb-3">
            Available Titles
          </h2>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" aria-hidden="true" />
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

          <div className={cn('flex flex-col gap-1.5 max-h-[600px] overflow-y-auto rounded-lg', 'bg-bg-surface/20 border border-white/5 p-2')}>
            {availableTitles.length === 0 ? (
              <p className="font-body text-sm text-text-tertiary text-center py-8">
                {searchQuery ? 'No titles match your search.' : 'All titles are featured.'}
              </p>
            ) : (
              availableTitles.map((title) => (
                <AvailableTitleItem key={title.id} title={title} onAdd={() => toggleFeatured(title.id)} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}


// ── Collections Tab ─────────────────────────────────────────────

const CATEGORY_CONFIG: Record<CollectionCategory, { label: string; icon: React.ReactNode; color: string }> = {
  'by-artist': { label: 'By Artist', icon: <Palette size={14} />, color: 'text-purple-400' },
  'by-author': { label: 'By Author', icon: <Users size={14} />, color: 'text-blue-400' },
  'recommended': { label: 'Recommended', icon: <Award size={14} />, color: 'text-amber-400' },
  'featured': { label: 'Featured', icon: <Star size={14} />, color: 'text-emerald-400' },
};

function CollectionsTab({
  collections: initialCollections,
  allTitles,
}: {
  collections: CuratedCollectionWithTitles[];
  allTitles: CurationTitle[];
}) {
  const [collections, setCollections] = useState(initialCollections);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const collectionsByCategory = useMemo(() => {
    const grouped: Record<CollectionCategory, CuratedCollectionWithTitles[]> = {
      'by-artist': [],
      'by-author': [],
      'recommended': [],
      'featured': [],
    };
    collections.forEach((c) => {
      grouped[c.category].push(c);
    });
    return grouped;
  }, [collections]);

  const handleCreate = useCallback((data: { name: string; category: CollectionCategory; description?: string }) => {
    startTransition(async () => {
      const result = await createCollection(data);
      if (result.success && result.data) {
        setCollections((prev) => [
          { ...result.data!, titleIds: [] } as CuratedCollectionWithTitles,
          ...prev,
        ]);
        setShowCreateForm(false);
      }
    });
  }, []);

  const handleDelete = useCallback((collectionId: string) => {
    startTransition(async () => {
      const result = await deleteCollection(collectionId);
      if (result.success) {
        setCollections((prev) => prev.filter((c) => c.id !== collectionId));
        if (expandedId === collectionId) setExpandedId(null);
      }
    });
  }, [expandedId]);

  const handleAddTitle = useCallback((collectionId: string, titleId: string) => {
    startTransition(async () => {
      const result = await addTitleToCollection(collectionId, titleId);
      if (result.success) {
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId
              ? { ...c, titleIds: [...c.titleIds, titleId] }
              : c,
          ),
        );
      }
    });
  }, []);

  const handleRemoveTitle = useCallback((collectionId: string, titleId: string) => {
    startTransition(async () => {
      const result = await removeTitleFromCollection(collectionId, titleId);
      if (result.success) {
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId
              ? { ...c, titleIds: c.titleIds.filter((id) => id !== titleId) }
              : c,
          ),
        );
      }
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Create Button */}
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-text-secondary">
          Organize titles into curated collections by category for public discovery.
        </p>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
            'font-heading text-sm font-bold transition-all duration-150',
            'bg-accent-primary text-white hover:bg-accent-primary/90',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          )}
        >
          <Plus size={16} aria-hidden="true" />
          New Collection
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <CreateCollectionForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
          isPending={isPending}
        />
      )}

      {/* Collections grouped by category */}
      {(Object.keys(CATEGORY_CONFIG) as CollectionCategory[]).map((category) => {
        const items = collectionsByCategory[category];
        const config = CATEGORY_CONFIG[category];

        return (
          <section key={category} aria-labelledby={`category-${category}`}>
            <h3
              id={`category-${category}`}
              className={cn('font-heading text-xs uppercase tracking-[0.2em] mb-3 flex items-center gap-2', config.color)}
            >
              {config.icon}
              {config.label}
              <span className="text-text-tertiary ml-1">({items.length})</span>
            </h3>

            {items.length === 0 ? (
              <p className="font-body text-xs text-text-tertiary pl-6 mb-4">
                No collections in this category yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                {items.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    allTitles={allTitles}
                    isExpanded={expandedId === collection.id}
                    onToggleExpand={() => setExpandedId(expandedId === collection.id ? null : collection.id)}
                    onDelete={() => handleDelete(collection.id)}
                    onAddTitle={(titleId) => handleAddTitle(collection.id, titleId)}
                    onRemoveTitle={(titleId) => handleRemoveTitle(collection.id, titleId)}
                    isPending={isPending}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

// ── Create Collection Form ──────────────────────────────────────

function CreateCollectionForm({
  onSubmit,
  onCancel,
  isPending,
}: {
  onSubmit: (data: { name: string; category: CollectionCategory; description?: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CollectionCategory>('recommended');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), category, description: description.trim() || undefined });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col gap-4 p-4 rounded-lg',
        'bg-bg-surface/40 border border-white/10',
      )}
    >
      <h4 className="font-heading text-sm font-bold text-text-primary">Create New Collection</h4>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="collection-name" className="font-heading text-xs text-text-secondary">
            Name
          </label>
          <input
            id="collection-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Best of 2024"
            required
            className={cn(
              'w-full px-3 py-2 rounded-lg',
              'bg-bg-deep/60 border border-white/10',
              'font-body text-sm text-text-primary placeholder:text-text-tertiary',
              'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="collection-category" className="font-heading text-xs text-text-secondary">
            Category
          </label>
          <select
            id="collection-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CollectionCategory)}
            className={cn(
              'w-full px-3 py-2 rounded-lg',
              'bg-bg-deep/60 border border-white/10',
              'font-body text-sm text-text-primary',
              'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
            )}
          >
            {(Object.keys(CATEGORY_CONFIG) as CollectionCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_CONFIG[cat].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="collection-description" className="font-heading text-xs text-text-secondary">
          Description (optional)
        </label>
        <textarea
          id="collection-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of this collection..."
          rows={2}
          className={cn(
            'w-full px-3 py-2 rounded-lg resize-none',
            'bg-bg-deep/60 border border-white/10',
            'font-body text-sm text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
          )}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!name.trim() || isPending}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
            'font-heading text-sm font-bold transition-all duration-150',
            name.trim() && !isPending
              ? 'bg-accent-primary text-white hover:bg-accent-primary/90'
              : 'bg-white/5 text-text-tertiary cursor-not-allowed',
          )}
        >
          <Plus size={14} aria-hidden="true" />
          Create
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-heading text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Collection Card ─────────────────────────────────────────────

function CollectionCard({
  collection,
  allTitles,
  isExpanded,
  onToggleExpand,
  onDelete,
  onAddTitle,
  onRemoveTitle,
  isPending,
}: {
  collection: CuratedCollectionWithTitles;
  allTitles: CurationTitle[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onAddTitle: (titleId: string) => void;
  onRemoveTitle: (titleId: string) => void;
  isPending: boolean;
}) {
  const [titleSearch, setTitleSearch] = useState('');

  const collectionTitles = useMemo(
    () => allTitles.filter((t) => collection.titleIds.includes(t.id)),
    [allTitles, collection.titleIds],
  );

  const availableForAdd = useMemo(() => {
    const notInCollection = allTitles.filter((t) => !collection.titleIds.includes(t.id));
    if (!titleSearch.trim()) return notInCollection.slice(0, 20);
    const q = titleSearch.toLowerCase();
    return notInCollection.filter((t) => t.title_english.toLowerCase().includes(q)).slice(0, 20);
  }, [allTitles, collection.titleIds, titleSearch]);

  const config = CATEGORY_CONFIG[collection.category];

  return (
    <div className={cn('rounded-lg border border-white/5 overflow-hidden', 'bg-bg-surface/30')}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggleExpand}
        role="button"
        aria-expanded={isExpanded}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleExpand(); } }}
      >
        <span className={cn('shrink-0', config.color)}>{config.icon}</span>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="font-body text-sm font-medium text-text-primary truncate">
            {collection.name}
          </span>
          {collection.description && (
            <span className="font-body text-xs text-text-tertiary truncate">
              {collection.description}
            </span>
          )}
        </div>
        <span className="font-data text-xs text-text-tertiary shrink-0">
          {collection.titleIds.length} title{collection.titleIds.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          disabled={isPending}
          className="shrink-0 p-1.5 rounded text-text-tertiary hover:text-red-400 hover:bg-red-400/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent-primary"
          aria-label={`Delete collection ${collection.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          {/* Current titles in collection */}
          {collectionTitles.length > 0 && (
            <div className="flex flex-col gap-2">
              <h5 className="font-heading text-xs uppercase tracking-[0.15em] text-text-tertiary">
                Titles in Collection
              </h5>
              <div className="flex flex-wrap gap-2">
                {collectionTitles.map((title) => (
                  <TitleBadge
                    key={title.id}
                    title={title}
                    onRemove={() => onRemoveTitle(title.id)}
                    isPending={isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add titles */}
          <div className="flex flex-col gap-2">
            <h5 className="font-heading text-xs uppercase tracking-[0.15em] text-text-tertiary">
              Add Titles
            </h5>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search titles to add..."
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                className={cn(
                  'w-full pl-8 pr-4 py-2 rounded-lg',
                  'bg-bg-deep/60 border border-white/10',
                  'font-body text-sm text-text-primary placeholder:text-text-tertiary',
                  'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
                  'transition-colors duration-150',
                )}
                aria-label="Search titles to add to collection"
              />
            </div>
            <div className={cn('flex flex-col gap-1 max-h-[200px] overflow-y-auto rounded-lg', 'bg-bg-deep/30 border border-white/5 p-1.5')}>
              {availableForAdd.length === 0 ? (
                <p className="font-body text-xs text-text-tertiary text-center py-4">
                  {titleSearch ? 'No matching titles found.' : 'No more titles available.'}
                </p>
              ) : (
                availableForAdd.map((title) => (
                  <button
                    key={title.id}
                    onClick={() => onAddTitle(title.id)}
                    disabled={isPending}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded text-left w-full',
                      'hover:bg-white/5 transition-colors',
                      'focus-visible:outline-2 focus-visible:outline-accent-primary',
                      'disabled:opacity-50',
                    )}
                  >
                    <div className="w-5 h-7 shrink-0 rounded overflow-hidden">
                      <CoverImage
                        slug={title.cover_slug ?? title.slug}
                        alt={title.title_english}
                        origin={title.origin}
                        dominantColor={title.dominant_color ?? '#1a1a2e'}
                        rounded={false}
                        sizes="20px"
                      />
                    </div>
                    <span className="font-body text-xs text-text-primary truncate flex-1">
                      {title.title_english}
                    </span>
                    <Plus size={12} className="text-text-tertiary shrink-0" aria-hidden="true" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Mood/Theme Curations Tab ────────────────────────────────────

function MoodCurationsTab({
  moodCurations: initialMoodCurations,
  allTitles,
}: {
  moodCurations: MoodCurationWithTitles[];
  allTitles: CurationTitle[];
}) {
  const [moodCurations, setMoodCurations] = useState(initialMoodCurations);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = useCallback((data: { name: string; description?: string }) => {
    startTransition(async () => {
      const result = await createMoodCuration(data);
      if (result.success && result.data) {
        setMoodCurations((prev) => [
          { ...result.data!, titleIds: [] } as MoodCurationWithTitles,
          ...prev,
        ]);
        setShowCreateForm(false);
      }
    });
  }, []);

  const handleDelete = useCallback((curationId: string) => {
    startTransition(async () => {
      const result = await deleteMoodCuration(curationId);
      if (result.success) {
        setMoodCurations((prev) => prev.filter((m) => m.id !== curationId));
        if (expandedId === curationId) setExpandedId(null);
      }
    });
  }, [expandedId]);

  const handleAddTitle = useCallback((curationId: string, titleId: string) => {
    startTransition(async () => {
      const result = await addTitleToMoodCuration(curationId, titleId);
      if (result.success) {
        setMoodCurations((prev) =>
          prev.map((m) =>
            m.id === curationId
              ? { ...m, titleIds: [...m.titleIds, titleId] }
              : m,
          ),
        );
      }
    });
  }, []);

  const handleRemoveTitle = useCallback((curationId: string, titleId: string) => {
    startTransition(async () => {
      const result = await removeTitleFromMoodCuration(curationId, titleId);
      if (result.success) {
        setMoodCurations((prev) =>
          prev.map((m) =>
            m.id === curationId
              ? { ...m, titleIds: m.titleIds.filter((id) => id !== titleId) }
              : m,
          ),
        );
      }
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Create Button */}
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-text-secondary">
          Create mood and theme curations to help readers discover titles by vibe.
        </p>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
            'font-heading text-sm font-bold transition-all duration-150',
            'bg-accent-primary text-white hover:bg-accent-primary/90',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          )}
        >
          <Plus size={16} aria-hidden="true" />
          New Mood / Theme
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <CreateMoodForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
          isPending={isPending}
        />
      )}

      {/* Mood Curations List */}
      {moodCurations.length === 0 ? (
        <div className={cn('flex flex-col items-center justify-center gap-3 py-16 rounded-lg', 'bg-bg-surface/30 border border-dashed border-white/10')}>
          <Sparkles size={24} className="text-text-tertiary" aria-hidden="true" />
          <p className="font-body text-sm text-text-secondary text-center max-w-xs">
            No mood/theme curations yet. Create one to start grouping titles by vibe.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {moodCurations.map((mood) => (
            <MoodCurationCard
              key={mood.id}
              mood={mood}
              allTitles={allTitles}
              isExpanded={expandedId === mood.id}
              onToggleExpand={() => setExpandedId(expandedId === mood.id ? null : mood.id)}
              onDelete={() => handleDelete(mood.id)}
              onAddTitle={(titleId) => handleAddTitle(mood.id, titleId)}
              onRemoveTitle={(titleId) => handleRemoveTitle(mood.id, titleId)}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Create Mood Form ────────────────────────────────────────────

function CreateMoodForm({
  onSubmit,
  onCancel,
  isPending,
}: {
  onSubmit: (data: { name: string; description?: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() || undefined });
  };

  const suggestions = [
    'Depressing Ending', 'Overpowered MC', 'No Romance', 'Pure Action',
    'Smart MC', 'Villain MC', 'Slow Burn', 'Comedy Gold', 'Dark Fantasy',
    'Wholesome', 'Revenge Plot', 'Time Travel',
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col gap-4 p-4 rounded-lg',
        'bg-bg-surface/40 border border-white/10',
      )}
    >
      <h4 className="font-heading text-sm font-bold text-text-primary">Create New Mood / Theme</h4>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mood-name" className="font-heading text-xs text-text-secondary">
          Name
        </label>
        <input
          id="mood-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Overpowered MC"
          required
          className={cn(
            'w-full px-3 py-2 rounded-lg',
            'bg-bg-deep/60 border border-white/10',
            'font-body text-sm text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
          )}
        />
        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setName(s)}
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-heading',
                'bg-white/5 text-text-tertiary hover:text-text-secondary hover:bg-white/10',
                'transition-colors duration-150',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mood-description" className="font-heading text-xs text-text-secondary">
          Description (optional)
        </label>
        <textarea
          id="mood-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the mood or theme..."
          rows={2}
          className={cn(
            'w-full px-3 py-2 rounded-lg resize-none',
            'bg-bg-deep/60 border border-white/10',
            'font-body text-sm text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
          )}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!name.trim() || isPending}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
            'font-heading text-sm font-bold transition-all duration-150',
            name.trim() && !isPending
              ? 'bg-accent-primary text-white hover:bg-accent-primary/90'
              : 'bg-white/5 text-text-tertiary cursor-not-allowed',
          )}
        >
          <Plus size={14} aria-hidden="true" />
          Create
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-heading text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Mood Curation Card ──────────────────────────────────────────

function MoodCurationCard({
  mood,
  allTitles,
  isExpanded,
  onToggleExpand,
  onDelete,
  onAddTitle,
  onRemoveTitle,
  isPending,
}: {
  mood: MoodCurationWithTitles;
  allTitles: CurationTitle[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onAddTitle: (titleId: string) => void;
  onRemoveTitle: (titleId: string) => void;
  isPending: boolean;
}) {
  const [titleSearch, setTitleSearch] = useState('');

  const moodTitles = useMemo(
    () => allTitles.filter((t) => mood.titleIds.includes(t.id)),
    [allTitles, mood.titleIds],
  );

  const availableForAdd = useMemo(() => {
    const notInMood = allTitles.filter((t) => !mood.titleIds.includes(t.id));
    if (!titleSearch.trim()) return notInMood.slice(0, 20);
    const q = titleSearch.toLowerCase();
    return notInMood.filter((t) => t.title_english.toLowerCase().includes(q)).slice(0, 20);
  }, [allTitles, mood.titleIds, titleSearch]);

  return (
    <div className={cn('rounded-lg border border-white/5 overflow-hidden', 'bg-bg-surface/30', isExpanded && 'sm:col-span-2')}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggleExpand}
        role="button"
        aria-expanded={isExpanded}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleExpand(); } }}
      >
        <Sparkles size={14} className="text-accent-tertiary shrink-0" aria-hidden="true" />
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="font-body text-sm font-medium text-text-primary truncate">
            {mood.name}
          </span>
          {mood.description && (
            <span className="font-body text-xs text-text-tertiary truncate">
              {mood.description}
            </span>
          )}
        </div>
        <span className="font-data text-xs text-text-tertiary shrink-0">
          {mood.titleIds.length} title{mood.titleIds.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          disabled={isPending}
          className="shrink-0 p-1.5 rounded text-text-tertiary hover:text-red-400 hover:bg-red-400/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent-primary"
          aria-label={`Delete mood curation ${mood.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          {/* Current titles */}
          {moodTitles.length > 0 && (
            <div className="flex flex-col gap-2">
              <h5 className="font-heading text-xs uppercase tracking-[0.15em] text-text-tertiary">
                Titles in this Mood / Theme
              </h5>
              <div className="flex flex-wrap gap-2">
                {moodTitles.map((title) => (
                  <TitleBadge
                    key={title.id}
                    title={title}
                    onRemove={() => onRemoveTitle(title.id)}
                    isPending={isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add titles */}
          <div className="flex flex-col gap-2">
            <h5 className="font-heading text-xs uppercase tracking-[0.15em] text-text-tertiary">
              Add Titles
            </h5>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search titles to add..."
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                className={cn(
                  'w-full pl-8 pr-4 py-2 rounded-lg',
                  'bg-bg-deep/60 border border-white/10',
                  'font-body text-sm text-text-primary placeholder:text-text-tertiary',
                  'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
                  'transition-colors duration-150',
                )}
                aria-label="Search titles to add to mood curation"
              />
            </div>
            <div className={cn('flex flex-col gap-1 max-h-[200px] overflow-y-auto rounded-lg', 'bg-bg-deep/30 border border-white/5 p-1.5')}>
              {availableForAdd.length === 0 ? (
                <p className="font-body text-xs text-text-tertiary text-center py-4">
                  {titleSearch ? 'No matching titles found.' : 'No more titles available.'}
                </p>
              ) : (
                availableForAdd.map((title) => (
                  <button
                    key={title.id}
                    onClick={() => onAddTitle(title.id)}
                    disabled={isPending}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded text-left w-full',
                      'hover:bg-white/5 transition-colors',
                      'focus-visible:outline-2 focus-visible:outline-accent-primary',
                      'disabled:opacity-50',
                    )}
                  >
                    <div className="w-5 h-7 shrink-0 rounded overflow-hidden">
                      <CoverImage
                        slug={title.cover_slug ?? title.slug}
                        alt={title.title_english}
                        origin={title.origin}
                        dominantColor={title.dominant_color ?? '#1a1a2e'}
                        rounded={false}
                        sizes="20px"
                      />
                    </div>
                    <span className="font-body text-xs text-text-primary truncate flex-1">
                      {title.title_english}
                    </span>
                    <Plus size={12} className="text-text-tertiary shrink-0" aria-hidden="true" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Shared Components ───────────────────────────────────────────

function TitleBadge({
  title,
  onRemove,
  isPending,
}: {
  title: CurationTitle;
  onRemove: () => void;
  isPending: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md',
        'bg-white/5 border border-white/10',
        'font-body text-xs text-text-primary',
      )}
    >
      <div className="w-4 h-5 shrink-0 rounded overflow-hidden">
        <CoverImage
          slug={title.cover_slug ?? title.slug}
          alt={title.title_english}
          origin={title.origin}
          dominantColor={title.dominant_color ?? '#1a1a2e'}
          rounded={false}
          sizes="16px"
        />
      </div>
      <span className="truncate max-w-[120px]">{title.title_english}</span>
      <button
        onClick={onRemove}
        disabled={isPending}
        className="shrink-0 p-0.5 rounded hover:bg-red-400/10 hover:text-red-400 text-text-tertiary transition-colors focus-visible:outline-2 focus-visible:outline-accent-primary"
        aria-label={`Remove ${title.title_english}`}
      >
        <X size={10} />
      </button>
    </span>
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
      <button
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-6 h-6 rounded text-text-tertiary hover:text-text-primary cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-accent-primary"
        aria-label={`Drag to reorder ${title.title_english}`}
      >
        <GripVertical size={16} />
      </button>

      <span className="font-data text-xs text-text-tertiary w-5 text-center shrink-0">
        {index + 1}
      </span>

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
              style={{ color: tierConfig.color, backgroundColor: `${tierConfig.color}20` }}
            >
              {title.tier}
            </span>
          )}
        </div>
      </div>

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
              style={{ color: tierConfig.color, backgroundColor: `${tierConfig.color}20` }}
            >
              {title.tier}
            </span>
          )}
        </div>
      </div>

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

      <div className="flex flex-col gap-4">
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
