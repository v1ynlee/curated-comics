// ============================================================
// Studio Curation Types
// ============================================================

export type CurationTab = 'featured' | 'mood-themes' | 'tiers';
export type CreatorType = 'author' | 'artist' | 'studio';

export interface CurationSettingsState {
  featuredNarrativesRandom: boolean;
  featuredTitlesRandom: boolean;
  featuredCreatorsRandom: boolean;
}

export interface CurationTitle {
  id: string;
  slug: string;
  title_english: string;
  origin: 'manhwa' | 'manga' | 'manhua';
  tier: string | null;
  cover_slug: string | null;
  dominant_color: string | null;
  featured: boolean;
  featured_order: number;
  featured_weight: number;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface FeaturedNarrative {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cta_text: string | null;
  cta_href: string | null;
  cover_slugs: string[];
  accent_color: string;
  display_order: number;
  featured_weight: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurationCreator {
  id: string;
  slug: string;
  name: string;
  type: CreatorType;
  image: string | null;
  website: string | null;
  title_count: number;
  featured: boolean;
  display_order: number;
  featured_weight: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface MoodTheme {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  theme_color: string | null;
  visible: boolean;
  sort_order: number;
  titleIds: string[];
  total_titles: number;
  created_at: string;
  updated_at: string;
}

export interface TierDefinition {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  display_order: number;
  visible: boolean;
  titleIds: string[];
  created_at: string;
  updated_at: string;
}

export interface StudioCurationData {
  settings: CurationSettingsState;
  titles: CurationTitle[];
  narratives: FeaturedNarrative[];
  creators: CurationCreator[];
  moodThemes: MoodTheme[];
  tiers: TierDefinition[];
}

export interface FeaturedCurationData {
  settings: CurationSettingsState;
  titles: CurationTitle[];
  narratives: FeaturedNarrative[];
  creators: CurationCreator[];
}

export interface MoodThemesData {
  titles: CurationTitle[];
  themes: MoodTheme[];
}

export interface TiersData {
  titles: CurationTitle[];
  tiers: TierDefinition[];
}
