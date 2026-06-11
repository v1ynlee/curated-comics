'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { StatStrip } from '@/components/studio/dashboard/StatStrip';
import { ArticleDashboardFilters } from '@/components/studio/filters/ArticleDashboardFilters';
import { StudioNotice } from '@/components/studio/shared/StudioNotice';
import type { EditorialState, PublicationState } from '@/types/article';
import type { StudioArticleRow } from '@/types/studio';
import { ArticleCardList } from './ArticleCardList';
import { ArticleDashboardHeader } from './ArticleDashboardHeader';
import { ArticleEmptyState } from './ArticleEmptyState';
import { ArticlePagination } from './ArticlePagination';
import { ArticleTable } from './ArticleTable';
import { BulkActionBar } from './BulkActionBar';
import { PAGE_SIZE } from './article-dashboard-constants';
import type { ArticleManagementDashboardProps, BulkOperation, FeaturedFilter, ServerResult, SortKey } from './article-dashboard-types';
import { buildFormData } from './article-dashboard-utils';

export function ArticleManagementDashboard({
  articles,
  categories,
  tags,
  archiveArticleAction,
  deleteArticleAction,
  setArticleStateAction,
  toggleFeaturedAction,
  bulkArticleAction,
}: ArticleManagementDashboardProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<PublicationState | 'all'>('all');
  const [workflowFilter, setWorkflowFilter] = useState<EditorialState | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated-desc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'All categories' },
      ...categories.map((category) => ({ value: category.slug, label: category.name })),
    ],
    [categories],
  );

  const tagOptions = useMemo(
    () => [
      { value: 'all', label: 'All tags' },
      ...tags.map((tag) => ({ value: tag.slug, label: tag.name })),
    ],
    [tags],
  );

  const stats = useMemo(() => [
    { label: 'Total', value: articles.length },
    { label: 'Published', value: articles.filter((article) => article.publicationState === 'published').length },
    { label: 'Needs Edit', value: articles.filter((article) => article.editorialState === 'needs_edit').length },
    { label: 'Ready Review', value: articles.filter((article) => article.editorialState === 'ready_for_review').length },
    { label: 'Approved', value: articles.filter((article) => article.editorialState === 'approved').length },
    { label: 'Scheduled', value: articles.filter((article) => article.editorialState === 'scheduled').length },
    { label: 'Featured', value: articles.filter((article) => article.featured).length },
  ], [articles]);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return articles
      .filter((article) => {
        if (stateFilter !== 'all' && article.publicationState !== stateFilter) return false;
        if (workflowFilter !== 'all' && article.editorialState !== workflowFilter) return false;
        if (categoryFilter !== 'all' && article.categorySlug !== categoryFilter) return false;
        if (tagFilter !== 'all' && !article.tagSlugs.includes(tagFilter)) return false;
        if (featuredFilter === 'featured' && !article.featured) return false;
        if (featuredFilter === 'standard' && article.featured) return false;

        if (!normalizedQuery) return true;

        const searchable = [
          article.title,
          article.subtitle ?? '',
          article.excerpt ?? '',
          article.categoryName ?? '',
          ...article.tagNames,
        ].join(' ').toLowerCase();

        return searchable.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sortKey === 'title-asc') return a.title.localeCompare(b.title);
        if (sortKey === 'words-desc') return b.wordCount - a.wordCount;
        if (sortKey === 'created-desc') return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        if (sortKey === 'publish-desc') return Date.parse(b.publishDate ?? '0') - Date.parse(a.publishDate ?? '0');
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      });
  }, [articles, categoryFilter, featuredFilter, query, sortKey, stateFilter, tagFilter, workflowFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleArticles = filteredArticles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const visibleIds = visibleArticles.map((article) => article.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const hasFilters = Boolean(
    query || stateFilter !== 'all' || workflowFilter !== 'all' || categoryFilter !== 'all' || tagFilter !== 'all' || featuredFilter !== 'all',
  );

  function resetPage() {
    setPage(1);
  }

  function clearFilters() {
    setQuery('');
    setStateFilter('all');
    setWorkflowFilter('all');
    setCategoryFilter('all');
    setTagFilter('all');
    setFeaturedFilter('all');
    setPage(1);
    toast.info('Article filters cleared.');
  }

  function toggleSelection(id: string) {
    const selected = selectedIds.includes(id);
    setSelectedIds((current) => (
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    ));
    toast.info(selected ? 'Article deselected.' : 'Article selected.');
  }

  function toggleVisibleSelection() {
    setSelectedIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !visibleIds.includes(id));
      return Array.from(new Set([...current, ...visibleIds]));
    });
    toast.info(allVisibleSelected ? 'Visible articles deselected.' : 'Visible articles selected.');
  }

  function finishAction(message: string) {
    setNotice({ type: 'success', message });
    toast.success(message);
    router.refresh();
  }

  async function runSingleAction(
    key: string,
    action: (formData: FormData) => ServerResult,
    formData: FormData,
    successMessage: string,
  ) {
    setPendingKey(key);
    const toastId = toast.loading('Applying article change...');
    try {
      const result = await action(formData);
      if (result.success) {
        toast.dismiss(toastId);
        finishAction(successMessage);
      } else {
        setNotice({ type: 'error', message: result.error ?? 'Article action failed.' });
        toast.error(result.error ?? 'Article action failed.', { id: toastId });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Article action failed.';
      setNotice({ type: 'error', message });
      toast.error(message, { id: toastId });
    } finally {
      setPendingKey(null);
    }
  }

  async function runBulkAction(operation: BulkOperation) {
    if (selectedIds.length === 0) return;

    if (operation === 'delete' && !confirmBulkDelete) {
      setConfirmBulkDelete(true);
      toast.warning('Confirm bulk delete to continue.');
      return;
    }

    const formData = buildFormData({
      ids: JSON.stringify(selectedIds),
      operation,
    });

    setPendingKey(`bulk-${operation}`);
    const toastId = toast.loading('Applying bulk action...');
    try {
      const result = await bulkArticleAction(formData);
      if (result.success) {
        const message = `${selectedIds.length} article${selectedIds.length === 1 ? '' : 's'} updated.`;
        setNotice({ type: 'success', message });
        toast.success(message, { id: toastId });
        setSelectedIds([]);
        setConfirmBulkDelete(false);
        router.refresh();
      } else {
        setNotice({ type: 'error', message: result.error ?? 'Bulk action failed.' });
        toast.error(result.error ?? 'Bulk action failed.', { id: toastId });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bulk action failed.';
      setNotice({ type: 'error', message });
      toast.error(message, { id: toastId });
    } finally {
      setPendingKey(null);
    }
  }

  function toggleArticleState(article: StudioArticleRow) {
    const nextState: PublicationState = article.publicationState === 'published' ? 'draft' : 'published';
    runSingleAction(
      `state-${article.id}`,
      setArticleStateAction,
      buildFormData({ id: article.id, publicationState: nextState }),
      nextState === 'published' ? 'Article published.' : 'Article moved to drafts.',
    );
  }

  function toggleFeatured(article: StudioArticleRow) {
    runSingleAction(
      `pin-${article.id}`,
      toggleFeaturedAction,
      buildFormData({ id: article.id, featured: String(!article.featured) }),
      article.featured ? 'Article unpinned.' : 'Article pinned as featured.',
    );
  }

  function archiveArticle(article: StudioArticleRow) {
    runSingleAction(
      `archive-${article.id}`,
      archiveArticleAction,
      buildFormData({ id: article.id }),
      'Article archived.',
    );
  }

  function deleteArticle(article: StudioArticleRow) {
    runSingleAction(
      `delete-${article.id}`,
      deleteArticleAction,
      buildFormData({ id: article.id }),
      'Article deleted.',
    );
  }

  const actionHandlers = {
    onToggleState: toggleArticleState,
    onToggleFeatured: toggleFeatured,
    onArchive: archiveArticle,
    onDelete: deleteArticle,
  };

  return (
    <div className="container-content max-w-7xl min-w-0 py-8 md:py-10">
      <ArticleDashboardHeader />
      <StatStrip items={stats} className="mb-5" />

      {notice && <StudioNotice notice={notice} onDismiss={() => setNotice(null)} />}

      <ArticleDashboardFilters
        query={query}
        stateFilter={stateFilter}
        workflowFilter={workflowFilter}
        categoryFilter={categoryFilter}
        tagFilter={tagFilter}
        featuredFilter={featuredFilter}
        sortKey={sortKey}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        shownCount={filteredArticles.length}
        totalCount={articles.length}
        hasFilters={hasFilters}
        onQueryChange={(value) => {
          setQuery(value);
          resetPage();
        }}
        onStateChange={(value) => {
          setStateFilter(value);
          resetPage();
        }}
        onWorkflowChange={(value) => {
          setWorkflowFilter(value);
          resetPage();
        }}
        onCategoryChange={(value) => {
          setCategoryFilter(value);
          resetPage();
        }}
        onTagChange={(value) => {
          setTagFilter(value);
          resetPage();
        }}
        onFeaturedChange={(value) => {
          setFeaturedFilter(value);
          resetPage();
        }}
        onSortChange={(value) => {
          setSortKey(value);
          resetPage();
        }}
        onClearFilters={clearFilters}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        pendingKey={pendingKey}
        confirmBulkDelete={confirmBulkDelete}
        onAction={runBulkAction}
        onClear={() => {
          setSelectedIds([]);
          setConfirmBulkDelete(false);
          toast.info('Article selection cleared.');
        }}
      />

      {articles.length === 0 ? (
        <ArticleEmptyState filtered={false} />
      ) : filteredArticles.length === 0 ? (
        <ArticleEmptyState filtered />
      ) : (
        <>
          <ArticleTable
            articles={visibleArticles}
            selectedIds={selectedIds}
            allVisibleSelected={allVisibleSelected}
            pendingKey={pendingKey}
            onToggleSelection={toggleSelection}
            onToggleVisibleSelection={toggleVisibleSelection}
            {...actionHandlers}
          />
          <ArticleCardList
            articles={visibleArticles}
            selectedIds={selectedIds}
            pendingKey={pendingKey}
            onToggleSelection={toggleSelection}
            {...actionHandlers}
          />
          <ArticlePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
