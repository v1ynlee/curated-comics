import type { ArticleFormData, EditorialState } from '@/types/article';

export const EDITORIAL_STATE_ORDER: EditorialState[] = [
  'draft',
  'needs_edit',
  'ready_for_review',
  'approved',
  'scheduled',
  'published',
  'archived',
];

export const EDITORIAL_STATE_LABELS: Record<EditorialState, string> = {
  draft: 'Draft',
  needs_edit: 'Needs Edit',
  ready_for_review: 'Ready For Review',
  approved: 'Approved',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
};

export type ArticleWorkflowCheckKey =
  | 'title'
  | 'excerpt'
  | 'cover'
  | 'category'
  | 'tags'
  | 'content-length'
  | 'reading-time'
  | 'empty-content'
  | 'broken-images'
  | 'broken-embeds'
  | 'metadata';

export interface ArticleWorkflowCheck {
  key: ArticleWorkflowCheckKey;
  label: string;
  passed: boolean;
  detail: string;
}

export interface ArticleWorkflowValidation {
  checks: ArticleWorkflowCheck[];
  failedChecks: ArticleWorkflowCheck[];
  readyForReview: boolean;
}

export interface ArticleWorkflowInput extends Pick<ArticleFormData, 'title' | 'body' | 'excerpt' | 'featuredImageId' | 'categoryId' | 'tagIds' | 'seoTitle' | 'seoDescription'> {
  wordCount?: number;
  readingTimeMinutes?: number;
  hasFeaturedImage?: boolean;
}

const MIN_REVIEW_WORD_COUNT = 250;

export function validateArticleWorkflow(input: ArticleWorkflowInput): ArticleWorkflowValidation {
  const body = input.body ?? '';
  const wordCount = input.wordCount ?? countWords(body);
  const readingTimeMinutes = input.readingTimeMinutes ?? (wordCount === 0 ? 0 : Math.ceil(wordCount / 200));
  const hasCover = Boolean(input.featuredImageId || input.hasFeaturedImage);
  const brokenImages = findBrokenImageReferences(body);
  const brokenEmbeds = findBrokenEmbedReferences(body);

  const checks: ArticleWorkflowCheck[] = [
    {
      key: 'title',
      label: 'Title',
      passed: Boolean(input.title.trim()),
      detail: 'Article has a working title.',
    },
    {
      key: 'excerpt',
      label: 'Excerpt',
      passed: Boolean(input.excerpt?.trim()),
      detail: 'Excerpt is available for cards and previews.',
    },
    {
      key: 'cover',
      label: 'Cover',
      passed: hasCover,
      detail: 'Thumbnail or featured image is attached.',
    },
    {
      key: 'category',
      label: 'Category',
      passed: Boolean(input.categoryId),
      detail: 'Article is assigned to a category.',
    },
    {
      key: 'tags',
      label: 'Tags',
      passed: input.tagIds.length > 0,
      detail: 'At least one tag is selected.',
    },
    {
      key: 'content-length',
      label: 'Content Length',
      passed: wordCount >= MIN_REVIEW_WORD_COUNT,
      detail: `${wordCount.toLocaleString()} words; ${MIN_REVIEW_WORD_COUNT.toLocaleString()} required for review.`,
    },
    {
      key: 'reading-time',
      label: 'Reading Time',
      passed: readingTimeMinutes > 0,
      detail: `${readingTimeMinutes} min read calculated from body content.`,
    },
    {
      key: 'empty-content',
      label: 'Empty Content',
      passed: Boolean(stripMarkup(body).trim()),
      detail: 'Body contains readable content.',
    },
    {
      key: 'broken-images',
      label: 'Broken Images',
      passed: brokenImages.length === 0,
      detail: brokenImages.length === 0 ? 'No empty image references found.' : `${brokenImages.length} image reference needs a URL.`,
    },
    {
      key: 'broken-embeds',
      label: 'Broken Embeds',
      passed: brokenEmbeds.length === 0,
      detail: brokenEmbeds.length === 0 ? 'No empty embed references found.' : `${brokenEmbeds.length} embed reference needs a URL.`,
    },
    {
      key: 'metadata',
      label: 'Missing Metadata',
      passed: Boolean(input.seoTitle?.trim() && input.seoDescription?.trim()),
      detail: 'SEO title and description are filled.',
    },
  ];

  const failedChecks = checks.filter((check) => !check.passed);
  return { checks, failedChecks, readyForReview: failedChecks.length === 0 };
}

export function canUseEditorialState(state: EditorialState, validation: ArticleWorkflowValidation) {
  if (state === 'ready_for_review' || state === 'approved' || state === 'scheduled' || state === 'published') {
    return validation.readyForReview;
  }
  return true;
}

function countWords(value: string) {
  return stripMarkup(value).split(/\s+/).filter(Boolean).length;
}

function stripMarkup(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/[#*_>`~\-[\]()]/g, ' ');
}

function findBrokenImageReferences(value: string) {
  const broken: string[] = [];
  const markdownImagePattern = /!\[[^\]]*\]\(([^)]*)\)/g;
  const htmlImagePattern = /<img\b[^>]*>/gi;
  let markdownMatch: RegExpExecArray | null;

  while ((markdownMatch = markdownImagePattern.exec(value)) !== null) {
    if (!markdownMatch[1]?.trim()) broken.push(markdownMatch[0]);
  }

  for (const match of value.matchAll(htmlImagePattern)) {
    const tag = match[0];
    const source = tag.match(/\ssrc=["']([^"']*)["']/i)?.[1];
    if (!source?.trim()) broken.push(tag);
  }

  return broken;
}

function findBrokenEmbedReferences(value: string) {
  const broken: string[] = [];
  const embedPattern = /<(iframe|embed)\b[^>]*>/gi;
  for (const match of value.matchAll(embedPattern)) {
    const tag = match[0];
    const source = tag.match(/\ssrc=["']([^"']*)["']/i)?.[1];
    if (!source?.trim()) broken.push(tag);
  }
  return broken;
}
