import type { ArticleFormData, EditorialState, PublicationState } from '@/types/article';
import { EDITORIAL_STATE_LABELS, EDITORIAL_STATE_ORDER } from '@/services/studio/article-workflow';

export const PUBLICATION_STATE_OPTIONS: { value: PublicationState; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export const EDITORIAL_STATE_OPTIONS: { value: EditorialState; label: string }[] = EDITORIAL_STATE_ORDER.map((value) => ({
  value,
  label: EDITORIAL_STATE_LABELS[value],
}));

export const DEFAULT_FORM_DATA: ArticleFormData = {
  title: '',
  subtitle: '',
  body: '',
  excerpt: '',
  featuredImageId: undefined,
  categoryId: undefined,
  tagIds: [],
  publicationState: 'draft',
  editorialState: 'draft',
  scheduledDate: undefined,
  seoTitle: '',
  seoDescription: '',
};

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
