# Component Architecture — Comic Curated

## Architecture Philosophy

Components are organized by **domain and responsibility**, not by type. A component lives where its purpose is clearest. The architecture supports:
- Cinematic composition (complex visual layouts)
- Performance isolation (heavy components don't affect light ones)
- Reusability without over-abstraction
- Clear data flow (props down, events up, global state minimal)

---

## Directory Structure

```
/src/
├── app/                          (Next.js App Router)
│   ├── layout.tsx                (Root layout: providers, fonts, global styles)
│   ├── page.tsx                  (Landing/Hero page)
│   ├── library/
│   │   ├── page.tsx              (Library browse)
│   │   └── [category]/
│   │       └── page.tsx          (Filtered library view)
│   ├── title/
│   │   └── [slug]/
│   │       └── page.tsx          (Title detail)
│   ├── discover/
│   │   └── page.tsx              (Mood/genre discovery)
│   ├── tiers/
│   │   └── page.tsx              (Tier list showcase)
│   ├── stats/
│   │   └── page.tsx              (Statistics dashboard)
│   └── about/
│       └── page.tsx              (Personal/branding page)
│
├── components/
│   ├── layout/                   (Structural components)
│   │   ├── Navigation.tsx        (Floating nav)
│   │   ├── MobileNav.tsx         (Bottom tab bar)
│   │   ├── Footer.tsx            (Minimal cinematic footer)
│   │   ├── PageTransition.tsx    (AnimatePresence wrapper)
│   │   └── Section.tsx           (Cinematic section wrapper)
│   │
│   ├── cinematic/                (Full-bleed visual components)
│   │   ├── Hero.tsx              (Landing hero experience)
│   │   ├── ParallaxSection.tsx   (Multi-layer parallax)
│   │   ├── AtmosphericBg.tsx     (Particle/gradient backgrounds)
│   │   ├── CinematicReveal.tsx   (Scroll-triggered dramatic reveal)
│   │   └── MoodTransition.tsx    (Color/atmosphere shift between sections)
│   │
│   ├── library/                  (Reading library components)
│   │   ├── LibraryGrid.tsx       (Asymmetrical masonry layout)
│   │   ├── TitleCard.tsx         (Individual title card)
│   │   ├── FeaturedCard.tsx      (Large featured title treatment)
│   │   ├── CategoryTabs.tsx      (Reading/Completed/Dropped tabs)
│   │   ├── FilterSheet.tsx       (Filter bottom sheet / sidebar)
│   │   └── SortControls.tsx      (Sort options)
│   │
│   ├── title/                    (Title detail components)
│   │   ├── TitleHero.tsx         (Immersive title header)
│   │   ├── RatingDisplay.tsx     (Multi-dimensional rating viz)
│   │   ├── ReviewSection.tsx     (Personal review content)
│   │   ├── ExternalLinks.tsx     (Reading source links)
│   │   ├── RelatedTitles.tsx     (Cinematic carousel)
│   │   └── TitleMeta.tsx         (Genre, status, chapters)
│   │
│   ├── discover/                 (Discovery components)
│   │   ├── MoodSelector.tsx      (Mood/genre picker)
│   │   ├── MoodAtmosphere.tsx    (Per-mood visual treatment)
│   │   ├── DiscoveryGrid.tsx     (Filtered results display)
│   │   └── MoodCard.tsx          (Individual mood category card)
│   │
│   ├── tiers/                    (Tier list components)
│   │   ├── TierRow.tsx           (Single tier with titles)
│   │   ├── TierLabel.tsx         (Tier name with visual treatment)
│   │   ├── TierItem.tsx          (Title within a tier)
│   │   └── TierDragContext.tsx   (Drag-and-drop wrapper)
│   │
│   ├── stats/                    (Statistics components)
│   │   ├── StatCard.tsx          (Individual stat with animation)
│   │   ├── GenreChart.tsx        (Genre distribution visualization)
│   │   ├── TimelineChart.tsx     (Reading history timeline)
│   │   ├── YearlyArc.tsx         (Annual reading summary)
│   │   └── ReadingStreak.tsx     (Streak visualization)
│   │
│   ├── achievements/             (Badge/achievement components)
│   │   ├── BadgeGrid.tsx         (Achievement showcase)
│   │   ├── BadgeCard.tsx         (Individual badge)
│   │   ├── BadgeUnlock.tsx       (Unlock animation)
│   │   └── ProgressRing.tsx      (Circular progress indicator)
│   │
│   └── ui/                       (Shared UI primitives)
│       ├── Button.tsx            (Styled button variants)
│       ├── Tag.tsx               (Genre/mood tag)
│       ├── Skeleton.tsx          (Loading skeleton)
│       ├── Image.tsx             (Custom image with blur-up)
│       ├── ScrollReveal.tsx      (Scroll-triggered reveal wrapper)
│       ├── GlowText.tsx          (Text with glow effect)
│       ├── GradientText.tsx      (Gradient-filled text)
│       ├── Tooltip.tsx           (Contextual tooltip)
│       ├── BottomSheet.tsx       (Mobile bottom sheet)
│       ├── Carousel.tsx          (Horizontal scroll carousel)
│       └── ProgressBar.tsx       (Animated progress bar)
│
├── hooks/                        (Custom React hooks)
│   ├── useScrollProgress.ts     (Scroll position 0-1)
│   ├── useInView.ts             (Intersection observer)
│   ├── useMediaQuery.ts         (Responsive breakpoints)
│   ├── usePrefersReducedMotion.ts
│   ├── usePerformanceTier.ts    (Device capability detection)
│   ├── useLenis.ts              (Lenis scroll instance)
│   ├── useMousePosition.ts      (Cursor tracking for effects)
│   └── useDebouncedValue.ts     (Debounced state)
│
├── lib/                          (Utilities and configuration)
│   ├── gsap-setup.ts            (GSAP + plugin registration)
│   ├── lenis-setup.ts           (Lenis initialization)
│   ├── animations.ts            (Shared animation variants)
│   ├── easings.ts               (Easing curve definitions)
│   ├── cn.ts                    (className utility)
│   ├── constants.ts             (App-wide constants)
│   └── utils.ts                 (General utilities)
│
├── stores/                       (Zustand stores)
│   ├── useUIStore.ts            (UI state: nav, theme, filters)
│   ├── useLibraryStore.ts       (Library filters, sort, view)
│   └── useAnimationStore.ts     (Animation tier, reduced motion)
│
├── services/                     (Data fetching layer)
│   ├── api.ts                   (Supabase client setup)
│   ├── titles.ts                (Title CRUD operations)
│   ├── reviews.ts               (Review operations)
│   ├── stats.ts                 (Statistics queries)
│   └── achievements.ts          (Badge/achievement logic)
│
├── types/                        (TypeScript definitions)
│   ├── title.ts                 (Title, Rating, Review types)
│   ├── library.ts               (Category, Filter types)
│   ├── stats.ts                 (Statistics types)
│   ├── achievements.ts          (Badge, Progress types)
│   └── ui.ts                    (UI state types)
│
└── styles/                       (Global styles)
    ├── globals.css              (Tailwind directives, CSS variables)
    ├── fonts.css                (Font-face declarations)
    └── animations.css           (CSS keyframe animations)
```

---

## Component Design Patterns

### Pattern 1: Cinematic Section Wrapper
Every major section uses a wrapper that handles:
- Scroll-triggered entrance animation
- Background atmosphere
- Responsive layout switching
- Performance containment

```typescript
interface SectionProps {
  id: string;
  atmosphere?: 'dark' | 'gradient' | 'particles';
  layout?: 'full-bleed' | 'contained' | 'editorial';
  revealAnimation?: 'fade' | 'slide-up' | 'cinematic';
  children: React.ReactNode;
}
```

### Pattern 2: Compound Components (Title Card)
Title cards have multiple visual states and compositions:

```typescript
// Compound component pattern
<TitleCard title={title}>
  <TitleCard.Cover />        {/* Image with blur-up */}
  <TitleCard.Overlay>        {/* Hover overlay */}
    <TitleCard.Rating />     {/* Quick rating display */}
    <TitleCard.Tags />       {/* Genre tags */}
  </TitleCard.Overlay>
  <TitleCard.Info>           {/* Below-image info */}
    <TitleCard.Title />
    <TitleCard.Status />
  </TitleCard.Info>
</TitleCard>
```

### Pattern 3: Animation-Aware Components
Components that animate are aware of the performance tier:

```typescript
const TitleCard = ({ title, index }) => {
  const tier = usePerformanceTier();
  const prefersReduced = usePrefersReducedMotion();
  
  const variants = prefersReduced 
    ? simpleVariants 
    : tier === 'high' 
      ? fullVariants 
      : reducedVariants;
  
  return (
    <motion.div variants={variants} custom={index}>
      {/* ... */}
    </motion.div>
  );
};
```

### Pattern 4: Data-Driven Atmosphere
Mood/genre affects the visual atmosphere:

```typescript
const MoodAtmosphere = ({ mood }: { mood: MoodType }) => {
  const atmosphereConfig = MOOD_ATMOSPHERES[mood];
  // Returns: { gradient, particleColor, accentColor, ambientAnimation }
  
  return (
    <div className="absolute inset-0 -z-10">
      <GradientBackground colors={atmosphereConfig.gradient} />
      {atmosphereConfig.particles && (
        <ParticleField color={atmosphereConfig.particleColor} />
      )}
    </div>
  );
};
```

---

## State Management Architecture

### Zustand Store Design

```typescript
// useUIStore.ts — Global UI state
interface UIState {
  // Navigation
  navVisible: boolean;
  mobileMenuOpen: boolean;
  
  // Theme
  currentMood: MoodType | null;  // Affects ambient colors
  
  // Performance
  animationTier: 'low' | 'mid' | 'high';
  reducedMotion: boolean;
  
  // Actions
  setNavVisible: (visible: boolean) => void;
  setCurrentMood: (mood: MoodType | null) => void;
  setAnimationTier: (tier: 'low' | 'mid' | 'high') => void;
}

// useLibraryStore.ts — Library browsing state
interface LibraryState {
  // Filters
  activeCategory: CategoryType;
  activeGenres: string[];
  activeMoods: string[];
  searchQuery: string;
  sortBy: SortOption;
  sortDirection: 'asc' | 'desc';
  
  // View
  viewMode: 'grid' | 'list' | 'cinematic';
  
  // Actions
  setCategory: (category: CategoryType) => void;
  toggleGenre: (genre: string) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}
```

### TanStack Query Patterns

```typescript
// Titles query with filtering
const useTitles = (filters: LibraryFilters) => {
  return useQuery({
    queryKey: ['titles', filters],
    queryFn: () => fetchTitles(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData, // Smooth filter transitions
  });
};

// Single title with prefetching
const useTitle = (slug: string) => {
  return useQuery({
    queryKey: ['title', slug],
    queryFn: () => fetchTitle(slug),
    staleTime: 10 * 60 * 1000,
  });
};

// Prefetch on hover (for smooth transitions)
const prefetchTitle = (slug: string) => {
  queryClient.prefetchQuery({
    queryKey: ['title', slug],
    queryFn: () => fetchTitle(slug),
  });
};
```

---

## Component Responsibility Matrix

| Component | Renders | Animates | Fetches Data | Manages State |
|-----------|---------|----------|--------------|---------------|
| Hero | ✅ | ✅ (GSAP) | ❌ | ❌ |
| LibraryGrid | ✅ | ✅ (Framer) | ✅ (TanStack) | ❌ |
| TitleCard | ✅ | ✅ (Framer) | ❌ | ❌ |
| CategoryTabs | ✅ | ✅ (Framer) | ❌ | ✅ (Zustand) |
| TitleHero | ✅ | ✅ (GSAP) | ✅ (TanStack) | ❌ |
| RatingDisplay | ✅ | ✅ (Framer) | ❌ | ❌ |
| MoodSelector | ✅ | ✅ (Framer) | ❌ | ✅ (Zustand) |
| StatCard | ✅ | ✅ (GSAP) | ❌ | ❌ |
| Navigation | ✅ | ✅ (Framer) | ❌ | ✅ (Zustand) |
| PageTransition | ✅ | ✅ (Framer) | ❌ | ❌ |

---

## Performance Isolation Strategy

### Heavy Components (Lazy Loaded)
```typescript
// These components are code-split and lazy loaded
const StatsCharts = dynamic(() => import('@/components/stats/GenreChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const TierDragContext = dynamic(() => import('@/components/tiers/TierDragContext'), {
  ssr: false,
});

const ParticleField = dynamic(() => import('@/components/cinematic/AtmosphericBg'), {
  ssr: false,
});
```

### Virtualization (Long Lists)
```typescript
// For library with 300+ titles
import { useVirtualizer } from '@tanstack/react-virtual';

const LibraryVirtualized = ({ titles }) => {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: titles.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // Estimated card height
    overscan: 5,
  });
  
  // Only render visible items
};
```

### Render Boundaries
```typescript
// Prevent re-renders from propagating
const MemoizedTitleCard = memo(TitleCard, (prev, next) => {
  return prev.title.id === next.title.id && 
         prev.title.updatedAt === next.title.updatedAt;
});
```

---

## Component Communication Flow

```
┌─────────────────────────────────────────────────┐
│                  App Layout                       │
│  ┌─────────────────────────────────────────────┐│
│  │  Providers (Query, Zustand, Lenis, Theme)   ││
│  │  ┌───────────────────────────────────────┐  ││
│  │  │  PageTransition (AnimatePresence)     │  ││
│  │  │  ┌─────────────────────────────────┐  │  ││
│  │  │  │  Page Component                 │  │  ││
│  │  │  │  ┌──────────┐ ┌──────────────┐ │  │  ││
│  │  │  │  │ Section  │ │   Section    │ │  │  ││
│  │  │  │  │┌────────┐│ │┌────────────┐│ │  │  ││
│  │  │  │  ││ Cards  ││ ││  Detail    ││ │  │  ││
│  │  │  │  │└────────┘│ │└────────────┘│ │  │  ││
│  │  │  │  └──────────┘ └──────────────┘ │  │  ││
│  │  │  └─────────────────────────────────┘  │  ││
│  │  └───────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────┘│
│  ┌──────────────────┐                           │
│  │  Navigation      │  (Fixed, outside flow)    │
│  └──────────────────┘                           │
└─────────────────────────────────────────────────┘

Data Flow:
  Supabase → TanStack Query → Page → Section → Component
  User Action → Zustand Store → Reactive UI Update
  Scroll → Lenis → GSAP ScrollTrigger → Animation
  Route Change → Framer Motion → Page Transition
```

---

## Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `TitleCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useScrollProgress.ts`)
- Utilities: `camelCase.ts` (e.g., `animations.ts`)
- Types: `camelCase.ts` (e.g., `title.ts`)
- Stores: `camelCase.ts` with `use` prefix (e.g., `useUIStore.ts`)

### Components
- Props interface: `{ComponentName}Props`
- Variants: `{componentName}Variants` (for Framer Motion)
- Refs: `{purpose}Ref` (e.g., `containerRef`, `titleRef`)

### CSS Classes (Tailwind)
- Custom utilities prefixed with project name where needed
- Animation classes: `animate-{name}` (e.g., `animate-shimmer`)
- State classes: `is-{state}` (e.g., `is-visible`, `is-active`)
