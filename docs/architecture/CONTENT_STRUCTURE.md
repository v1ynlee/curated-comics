# Content Structure — Comic Curated

## Information Architecture

This document defines how content is organized, categorized, and related throughout the application.

---

## Content Entities

### Title (Core Entity)
The primary content unit — a single manhwa, manhua, or manga series.

```typescript
interface Title {
  // Identity
  id: string;                    // UUID
  slug: string;                  // URL-friendly identifier
  titleEnglish: string;          // English/romanized title
  titleOriginal?: string;        // Original language title (Korean/Chinese/Japanese)
  titleAlternative?: string[];   // Alternative names
  
  // Classification
  origin: 'manhwa' | 'manhua' | 'manga';
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  
  // Reading Status
  readingStatus: ReadingStatus;
  chaptersRead: number;
  totalChapters?: number;        // null if ongoing
  startedDate?: Date;
  completedDate?: Date;
  lastReadDate: Date;
  rereadCount: number;
  
  // Categorization
  genres: Genre[];
  moods: Mood[];
  tags: string[];                // Free-form tags
  tier: TierLevel;
  
  // Ratings
  ratings: TitleRatings;
  
  // Content
  synopsis?: string;             // Brief plot summary
  review?: Review;
  vibeCheck?: string;            // One-line mood description
  quotableLines?: string[];      // Memorable quotes/reactions
  
  // Media
  coverImage: ImageAsset;
  bannerImage?: ImageAsset;
  
  // External
  externalLinks: ExternalLink[];
  
  // Meta
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
  hidden: boolean;               // For private entries
}
```

### Reading Status
```typescript
type ReadingStatus = 
  | 'reading'        // Currently active
  | 'completed'      // Finished
  | 'dropped'        // Abandoned
  | 'paused'         // On hold
  | 'wishlist'       // Plan to read
  | 'hidden-gem'     // Underrated discovery
  | 'guilty-pleasure' // Trash but loved
  | 'top-favorite'   // All-time best
  | 'most-reread';   // Comfort re-reads
```

### Ratings
```typescript
interface TitleRatings {
  overall: number;       // 1-10, half-point precision
  emotional: number;     // How deeply it affected you
  art: number;           // Visual quality
  story: number;         // Narrative quality
  pacing: number;        // Flow and rhythm
  ending?: number;       // Only for completed titles
}
```

### Review
```typescript
interface Review {
  id: string;
  titleId: string;
  
  // Content
  body: string;              // Markdown-formatted review
  tldr: string;              // One-paragraph summary
  vibeCheck: string;         // One-line mood
  
  // Sections
  whatILoved?: string;
  whatIHated?: string;
  emotionalDamage?: string;  // How it made you feel
  wouldRecommendTo?: string; // Who should read this
  
  // Spoiler handling
  hasSpoilers: boolean;
  spoilerSections?: string[]; // Marked spoiler blocks
  
  // Meta
  writtenDate: Date;
  lastEdited?: Date;
  wordCount: number;
}
```

### Genre
```typescript
interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;           // Associated color for UI
  icon?: string;           // Optional icon identifier
}

// Predefined genres
const GENRES = [
  'action', 'adventure', 'comedy', 'drama', 'fantasy',
  'horror', 'martial-arts', 'murim', 'mystery', 'psychological',
  'regression', 'reincarnation', 'romance', 'school-life',
  'sci-fi', 'slice-of-life', 'sports', 'supernatural',
  'system', 'thriller', 'tower', 'villainess', 'wuxia',
];
```

### Mood (Non-Traditional Categories)
```typescript
interface Mood {
  id: string;
  name: string;              // Display name
  slug: string;
  description: string;       // What this mood means
  atmosphere: MoodAtmosphere; // Visual treatment config
  emoji?: string;            // Quick visual identifier
}

const MOODS = [
  { name: 'Depression Arc', slug: 'depression-arc', emoji: '🖤' },
  { name: 'Aura Farming', slug: 'aura-farming', emoji: '✨' },
  { name: 'Brainrot', slug: 'brainrot', emoji: '🧠' },
  { name: 'Manipulator MC', slug: 'manipulator-mc', emoji: '🎭' },
  { name: 'Comfy Slice of Life', slug: 'comfy-sol', emoji: '☕' },
  { name: 'Revenge Fantasy', slug: 'revenge-fantasy', emoji: '🔥' },
  { name: 'Murim Addiction', slug: 'murim-addiction', emoji: '⚔️' },
  { name: 'Power Fantasy', slug: 'power-fantasy', emoji: '💪' },
  { name: 'Emotional Damage', slug: 'emotional-damage', emoji: '💔' },
  { name: 'Villainess Era', slug: 'villainess-era', emoji: '👑' },
  { name: 'Necromancer Vibes', slug: 'necromancer-vibes', emoji: '💀' },
  { name: 'Regression Loop', slug: 'regression-loop', emoji: '🔄' },
  { name: 'Tower Climbing', slug: 'tower-climbing', emoji: '🗼' },
  { name: 'System Addict', slug: 'system-addict', emoji: '📊' },
  { name: 'Art So Good It Hurts', slug: 'art-god', emoji: '🎨' },
  { name: 'Guilty Pleasure Trash', slug: 'guilty-trash', emoji: '🗑️' },
];
```

### Tier System
```typescript
type TierLevel = 
  | 'SSS+'    // Transcendent — life-changing
  | 'S'       // Peak Fiction — masterpiece
  | 'A'       // Excellent — highly recommended
  | 'B'       // Good — enjoyable
  | 'C'       // Generic But Addictive — mid but readable
  | 'D'       // Mid — forgettable
  | 'F';      // Trash But I Love It — so bad it's good

interface TierConfig {
  level: TierLevel;
  label: string;
  description: string;
  color: string;
  glowColor: string;
  textEffect: 'glow' | 'gradient' | 'normal';
}

const TIER_CONFIG: Record<TierLevel, TierConfig> = {
  'SSS+': {
    level: 'SSS+',
    label: 'Transcendent',
    description: 'Changed my brain chemistry',
    color: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.5)',
    textEffect: 'glow',
  },
  'S': {
    level: 'S',
    label: 'Peak Fiction',
    description: 'Masterpiece, no notes',
    color: '#E040FB',
    glowColor: 'rgba(224, 64, 251, 0.4)',
    textEffect: 'gradient',
  },
  // ... etc
};
```

### Achievement / Badge
```typescript
interface Achievement {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;              // SVG path or component
  
  // Unlock conditions
  condition: AchievementCondition;
  progress: number;          // 0-100
  unlocked: boolean;
  unlockedDate?: Date;
  
  // Visual
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  glowEffect: boolean;
}

interface AchievementCondition {
  type: 'count' | 'genre' | 'rating' | 'streak' | 'special';
  target: number;
  current: number;
  filter?: Record<string, any>; // Genre filter, status filter, etc.
}

const ACHIEVEMENTS = [
  {
    name: 'Murim Survivor',
    condition: { type: 'genre', target: 50, filter: { genre: 'murim' } },
    rarity: 'epic',
  },
  {
    name: 'Villainess Addict',
    condition: { type: 'genre', target: 30, filter: { genre: 'villainess' } },
    rarity: 'rare',
  },
  {
    name: 'Speed Reader',
    condition: { type: 'count', target: 1000, filter: { period: 'month', metric: 'chapters' } },
    rarity: 'legendary',
  },
  // ... more
];
```

### External Link
```typescript
interface ExternalLink {
  platform: ExternalPlatform;
  url: string;
  label?: string;
}

type ExternalPlatform = 
  | 'webtoon'
  | 'kakaopage'
  | 'naver'
  | 'tapas'
  | 'mangadex'
  | 'tappytoon'
  | 'lezhin'
  | 'official'
  | 'other';

// Platform metadata for UI
const PLATFORM_CONFIG: Record<ExternalPlatform, PlatformInfo> = {
  webtoon: { name: 'Webtoon', color: '#00D564', icon: 'webtoon-icon' },
  kakaopage: { name: 'KakaoPage', color: '#FFCD00', icon: 'kakao-icon' },
  naver: { name: 'Naver', color: '#03C75A', icon: 'naver-icon' },
  tapas: { name: 'Tapas', color: '#FF5A5F', icon: 'tapas-icon' },
  mangadex: { name: 'MangaDex', color: '#FF6740', icon: 'mangadex-icon' },
  // ...
};
```

### Image Asset
```typescript
interface ImageAsset {
  slug: string;
  alt: string;
  blurDataURL: string;       // Base64 LQIP
  dominantColor: string;     // For placeholder bg
  aspectRatio: number;       // width/height
  sizes: {
    sm: string;              // 320w path
    md: string;              // 640w path
    lg: string;              // 1200w path
  };
}
```

---

## Content Relationships

```
Title ──────── has many ──────── Genres
Title ──────── has many ──────── Moods
Title ──────── has one ─────────  Review
Title ──────── has one ─────────  TierLevel
Title ──────── has many ──────── ExternalLinks
Title ──────── has one ─────────  Ratings
Title ──────── contributes to ── Achievements
Title ──────── has many ──────── Tags

Genre ──────── has many ──────── Titles
Mood ─────────  has many ──────── Titles
Achievement ── depends on ────── Title collection
Statistics ─── derived from ──── Title collection
```

---

## Content Organization Views

### By Reading Status (Library)
```
├── Currently Reading (sorted by lastReadDate)
├── Completed (sorted by completedDate)
├── Paused (sorted by lastReadDate)
├── Dropped (sorted by lastReadDate)
├── Wishlist (sorted by createdAt)
├── Hidden Gems (sorted by rating)
├── Guilty Pleasures (sorted by rereadCount)
├── Top Favorites (sorted by overall rating)
└── Most Re-read (sorted by rereadCount)
```

### By Mood (Discovery)
```
├── Depression Arc
├── Aura Farming
├── Brainrot
├── Manipulator MC
├── Comfy Slice of Life
├── Revenge Fantasy
├── Murim Addiction
├── Power Fantasy
├── Emotional Damage
├── Villainess Era
├── Necromancer Vibes
└── Regression Loop
```

### By Tier (Tier List)
```
├── SSS+ (Transcendent)
├── S (Peak Fiction)
├── A (Excellent)
├── B (Good)
├── C (Generic But Addictive)
├── D (Mid)
└── F (Trash But I Love It)
```

### By Origin
```
├── Korean Manhwa
├── Chinese Manhua
└── Japanese Manga
```

---

## Statistics Derivation

### Computed Statistics
```typescript
interface ReadingStatistics {
  // Volume
  totalTitles: number;
  totalChaptersRead: number;
  estimatedReadingHours: number;  // chapters × 4 minutes average
  
  // Distribution
  genreDistribution: Record<string, number>;
  moodDistribution: Record<string, number>;
  originDistribution: Record<string, number>;
  tierDistribution: Record<TierLevel, number>;
  statusDistribution: Record<ReadingStatus, number>;
  
  // Timeline
  monthlyChapters: { month: string; count: number }[];
  yearlyTitles: { year: number; count: number }[];
  readingStreak: { current: number; longest: number };
  
  // Averages
  averageRating: number;
  averageChaptersPerTitle: number;
  completionRate: number;        // completed / (completed + dropped)
  
  // Records
  longestTitle: Title;           // Most chapters
  highestRated: Title;
  mostReread: Title;
  fastestCompleted: Title;       // Shortest time start → finish
}
```

### Calculation Rules
- Reading hours: `totalChapters × 4 minutes` (average manhwa chapter reading time)
- Completion rate: `completed / (completed + dropped) × 100`
- Reading streak: consecutive days with at least 1 chapter logged
- Monthly/yearly aggregations based on `lastReadDate`

---

## Search & Filter System

### Searchable Fields
- Title (English, Original, Alternative)
- Genre names
- Mood names
- Tags
- Review body text
- Vibe check text

### Filter Dimensions
```typescript
interface LibraryFilters {
  status?: ReadingStatus[];
  genres?: string[];
  moods?: string[];
  origin?: ('manhwa' | 'manhua' | 'manga')[];
  tier?: TierLevel[];
  ratingMin?: number;
  ratingMax?: number;
  chaptersMin?: number;
  chaptersMax?: number;
  hasReview?: boolean;
  featured?: boolean;
  search?: string;
}
```

### Sort Options
```typescript
type SortOption = 
  | 'title-asc'
  | 'title-desc'
  | 'rating-high'
  | 'rating-low'
  | 'chapters-high'
  | 'chapters-low'
  | 'recent-read'
  | 'date-added'
  | 'date-completed'
  | 'reread-count';
```

---

## Content Entry Workflow

### Adding a New Title
```
1. Enter basic info (title, origin, status)
2. Upload/assign cover image
3. Set genres and moods
4. Set initial reading status and chapter count
5. Optionally: add ratings, review, tier, links
6. Image pipeline processes cover automatically
7. Statistics recalculate
8. Achievement progress updates
```

### Updating Reading Progress
```
1. Update chapters read
2. Update lastReadDate (automatic)
3. If completed: set completedDate, prompt for ending rating
4. Recalculate statistics
5. Check achievement conditions
```
