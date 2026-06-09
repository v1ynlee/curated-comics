import type { ArticleFormData, PublicationState } from '@/types/article';

export const PUBLICATION_STATE_OPTIONS: { value: PublicationState; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export const DEFAULT_FORM_DATA: ArticleFormData = {
  title: '',
  subtitle: '',
  body: '',
  excerpt: '',
  featuredImageId: undefined,
  categoryId: undefined,
  tagIds: [],
  publicationState: 'draft',
  scheduledDate: undefined,
  seoTitle: '',
  seoDescription: '',
};

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
