// ============================================================
// Creator Types
// ============================================================

import type { Origin, TierLevel, Title } from './title';

export type CreatorType = 'author' | 'artist' | 'studio';
export type CreatorRole = 'author' | 'artist' | 'studio';

export interface Creator {
  id: string;
  slug: string;
  name: string;
  type: CreatorType;
  description?: string;
  image?: string;
  website?: string;
  roles: CreatorRole[];
  titleCount: number;
  createdAt: string;
  works?: CreatorWork[];
}

export interface CreatorWork {
  id: string;
  slug: string;
  title: string;
  coverSlug: string;
  dominantColor?: string;
  origin?: Origin;
  tier?: TierLevel;
}

export interface CreatorTitle {
  title: Title;
  roles: CreatorRole[];
}

export interface CreatorProfile {
  creator: Creator;
  titles: CreatorTitle[];
}
