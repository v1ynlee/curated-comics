import type { ArticleFormData } from '@/types/article';

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface TagOption {
  id: string;
  name: string;
  slug: string;
}

export interface FeaturedImagePreview {
  id: string;
  url: string | null;
  dominantColor: string | null;
}

export interface ArticleEditorProps {
  mode: 'create' | 'edit';
  initialData?: ArticleFormData;
  initialFeaturedImage?: FeaturedImagePreview | null;
  articleSlug?: string;
  saveAction: (data: ArticleFormData) => Promise<void>;
  createCategoryAction?: (name: string) => Promise<CategoryOption>;
  createTagAction?: (name: string) => Promise<TagOption>;
  categories?: CategoryOption[];
  tags?: TagOption[];
}
