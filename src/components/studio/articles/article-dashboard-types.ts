import type { PublicationState } from '@/types/article';
import type { StudioArticleRow } from '@/types/studio';

export type ServerResult = Promise<{ success: boolean; error?: string }>;

export interface ArticleManagementDashboardProps {
  articles: StudioArticleRow[];
  categories: { id: string; name: string; slug: string; color: string | null }[];
  tags: { id: string; name: string; slug: string }[];
  archiveArticleAction: (formData: FormData) => ServerResult;
  deleteArticleAction: (formData: FormData) => ServerResult;
  setArticleStateAction: (formData: FormData) => ServerResult;
  toggleFeaturedAction: (formData: FormData) => ServerResult;
  bulkArticleAction: (formData: FormData) => ServerResult;
}

export type FeaturedFilter = 'all' | 'featured' | 'standard';
export type SortKey = 'updated-desc' | 'created-desc' | 'publish-desc' | 'title-asc' | 'words-desc';
export type BulkOperation = 'draft' | 'published' | 'archived' | 'delete';

export interface ArticleActionHandlers {
  onToggleState: (article: StudioArticleRow) => void;
  onToggleFeatured: (article: StudioArticleRow) => void;
  onArchive: (article: StudioArticleRow) => void;
  onDelete: (article: StudioArticleRow) => void;
}

export type ArticleStateOption = { value: PublicationState | 'all'; label: string };
