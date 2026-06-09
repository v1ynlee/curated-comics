'use client';

// ============================================================
// CurationInterface — editorial curation shell
// ============================================================

import { lazy, Suspense, useState, useSyncExternalStore, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layers3, Search, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { loadMoodThemesCurationData, loadTiersCurationData } from './actions';
import { CurationTabSkeleton } from './components/CurationSkeleton';
import { SortDropdown, type SortKey } from './components/SortDropdown';
import { useDebouncedValue } from './components/useDebouncedValue';
import type { CurationTab, FeaturedCurationData, MoodThemesData, TiersData } from './types';

const FeaturedTab = lazy(() => import('./components/FeaturedTab').then((module) => ({ default: module.FeaturedTab })));
const MoodThemesTab = lazy(() => import('./components/MoodThemesTab').then((module) => ({ default: module.MoodThemesTab })));
const TiersTab = lazy(() => import('./components/TiersTab').then((module) => ({ default: module.TiersTab })));

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface CurationInterfaceProps {
  initialFeaturedData: FeaturedCurationData;
}

const TABS: { id: CurationTab; label: string; icon: React.ReactNode }[] = [
  { id: 'featured', label: 'Featured', icon: <Star className="h-4 w-4" /> },
  { id: 'mood-themes', label: 'Mood Themes', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'tiers', label: 'Tiers', icon: <Layers3 className="h-4 w-4" /> },
];

export function CurationInterface({ initialFeaturedData }: CurationInterfaceProps) {
  const hasMounted = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const [activeTab, setActiveTab] = useState<CurationTab>('featured');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('updated');
  const [moodData, setMoodData] = useState<MoodThemesData | null>(null);
  const [tiersData, setTiersData] = useState<TiersData | null>(null);
  const [loadingTab, setLoadingTab] = useState<CurationTab | null>(null);
  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebouncedValue(search, 180);

  const activateTab = (tab: CurationTab) => {
    setActiveTab(tab);
    if (tab === 'mood-themes' && !moodData) {
      setLoadingTab(tab);
      startTransition(async () => {
        try {
          setMoodData(await loadMoodThemesCurationData());
        } finally {
          setLoadingTab(null);
        }
      });
    }
    if (tab === 'tiers' && !tiersData) {
      setLoadingTab(tab);
      startTransition(async () => {
        try {
          setTiersData(await loadTiersCurationData());
        } finally {
          setLoadingTab(null);
        }
      });
    }
  };

  const tabLoading = isPending || loadingTab === activeTab;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex w-full flex-col gap-3 rounded-lg border border-white/10 bg-bg-surface/25 p-3 md:flex-row md:items-center md:justify-between">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Curation sections" role="tablist">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => activateTab(tab.id)}
                className={cn(
                  'relative inline-flex h-10 items-center gap-2 px-3 font-heading text-sm transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                  active ? 'text-accent-primary' : 'text-text-tertiary hover:text-text-secondary',
                )}
                aria-selected={active}
                role="tab"
              >
                {tab.icon}
                {tab.label}
                {active && (
                  <motion.span
                    layoutId="curation-tab-underline"
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent-primary"
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search curation"
              className="h-10 w-full rounded-md border border-white/10 bg-bg-deep/50 pl-9 pr-3 font-body text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-primary/60"
              aria-label="Search curation items"
            />
          </div>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full"
          >
            <Suspense fallback={<CurationTabSkeleton />}>
              {!hasMounted ? (
                <CurationTabSkeleton />
              ) : (
                <>
                  {activeTab === 'featured' && (
                    <FeaturedTab data={initialFeaturedData} search={debouncedSearch} sortBy={sortBy} />
                  )}
                  {activeTab === 'mood-themes' && (
                    tabLoading || !moodData
                      ? <CurationTabSkeleton />
                      : <MoodThemesTab titles={moodData.titles} themes={moodData.themes} search={debouncedSearch} sortBy={sortBy} />
                  )}
                  {activeTab === 'tiers' && (
                    tabLoading || !tiersData
                      ? <CurationTabSkeleton />
                      : <TiersTab titles={tiersData.titles} tiers={tiersData.tiers} search={debouncedSearch} sortBy={sortBy} />
                  )}
                </>
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
