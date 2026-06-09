// ============================================================
// Shared Navigation Config
// Pure static data to keep SSR and CSR navigation output aligned.
// ============================================================

export type NavIconKey = 'home' | 'book' | 'search' | 'star' | 'dashboard' | 'users' | 'file' | 'image';

export interface NavItemConfig {
  href: string;
  label: string;
  exact: boolean;
  title?: string;
  icon: NavIconKey;
}

export const PUBLIC_NAV_ITEMS: readonly NavItemConfig[] = [
  { href: '/', label: 'Home', exact: true, icon: 'home' },
  { href: '/library', label: 'Library', exact: false, icon: 'book' },
  { href: '/discover', label: 'Discover', exact: false, icon: 'search' },
  { href: '/tiers', label: 'Tiers', exact: false, icon: 'star' },
  { href: '/stats', label: 'Stats', exact: false, icon: 'dashboard' },
  { href: '/creators', label: 'Creators', exact: false, icon: 'users' },
  { href: '/news', label: 'News', exact: false, icon: 'file' },
] as const;

export const STUDIO_NAV_ITEMS: readonly NavItemConfig[] = [
  { href: '/studio', label: 'Dashboard', exact: true, title: 'Overview, stats, and recent activity', icon: 'dashboard' },
  { href: '/studio/titles', label: 'Titles', exact: false, title: 'Manage your manga, manhwa, and manhua collection', icon: 'book' },
  { href: '/studio/articles', label: 'Articles', exact: false, title: 'Write and manage editorial content', icon: 'file' },
  { href: '/studio/media', label: 'Media', exact: false, title: 'Upload and organize images and assets', icon: 'image' },
  { href: '/studio/curation', label: 'Curation', exact: false, title: 'Featured content, themes, creators, and tiers', icon: 'star' },
] as const;
