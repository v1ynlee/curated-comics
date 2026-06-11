export type QAIssueType =
  | 'missing-covers'
  | 'missing-synopsis'
  | 'missing-genres'
  | 'missing-moods'
  | 'missing-creators'
  | 'missing-reading-urls'
  | 'unreviewed-titles'
  | 'draft-content'
  | 'broken-featured';

export type QAEntityType = 'title' | 'article' | 'creator' | 'featured-title' | 'featured-creator' | 'narrative';

export type QAQuickAction =
  | 'open-editor'
  | 'upload-cover'
  | 'archive-title'
  | 'open-details-editor'
  | 'fill-synopsis-ai'
  | 'ignore'
  | 'assign-creator'
  | 'open-creator-manager'
  | 'open-reading-url-manager'
  | 'add-reading-url'
  | 'open-review-card'
  | 'mark-reviewed'
  | 'remove-featured-title'
  | 'replace-featured-title'
  | 'open-title'
  | 'remove-featured-creator'
  | 'replace-featured-creator'
  | 'archive-creator'
  | 'open-narrative-editor'
  | 'auto-remove-broken-references';

export type QABulkAction = 'mark-reviewed' | 'archive' | 'ignore' | 'remove-featured';

export interface QAIssueSummary {
  type: QAIssueType;
  label: string;
  description: string;
  count: number;
}

export interface QAResultItem {
  id: string;
  entityId: string;
  entityType: QAEntityType;
  slug: string | null;
  title: string;
  subtitle: string | null;
  coverSlug: string | null;
  issueType: QAIssueType;
  issueLabel: string;
  issueDetail: string | null;
  updatedAt: string;
  editorHref: string;
  quickFixLabel: string;
  quickFixHref: string;
  actions: QAQuickAction[];
  bulkActions: QABulkAction[];
  completionScore?: number | null;
  metadata?: Record<string, unknown>;
}

export interface QAOption {
  id: string;
  label: string;
  subtitle?: string | null;
}

export interface QAData {
  summaries: QAIssueSummary[];
  results: QAResultItem[];
  creatorOptions: QAOption[];
  featuredTitleOptions: QAOption[];
  featuredCreatorOptions: QAOption[];
}
