// ============================================================
// Article & Editorial Types
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
// ============================================================

import type { MediaAsset } from './media';

export type PublicationState = 'draft' | 'scheduled' | 'published' | 'archived';

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  body: string;
  excerpt: string | null;
  featuredImage: MediaAsset | null;
  category: ArticleCategory | null;
  tags: ArticleTag[];
  publicationState: PublicationState;
  publishDate: string | null;
  scheduledDate: string | null;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  featuredImage: { url: string; blurDataUri: string; dominantColor: string } | null;
  category: { name: string; slug: string; color: string } | null;
  publishDate: string;
  readingTimeMinutes: number;
  featured: boolean;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  sortOrder: number;
}

export interface ArticleTag {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleFormData {
  title: string;
  subtitle?: string;
  body: string;
  excerpt?: string;
  featuredImageId?: string;
  categoryId?: string;
  tagIds: string[];
  publicationState: PublicationState;
  scheduledDate?: string;
  seoTitle?: string;
  seoDescription?: string;
}
