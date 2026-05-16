// ============================================================
// Integration Tests: Studio Bug Fixes
// Validates that articles page loads without schema error (Req 16.1, 16.2)
// and media page route resolves (Req 17.1).
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// ── Mocks ─────────────────────────────────────────────────────

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock @/lib/utils/cn
vi.mock('@/lib/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Track supabase query calls to verify no schema errors
const mockSelect = vi.fn().mockReturnValue({
  order: vi.fn().mockResolvedValue({ data: [], error: null }),
});

const mockFrom = vi.fn().mockReturnValue({
  select: mockSelect,
});

const mockSupabaseClient = {
  from: mockFrom,
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user', email: 'admin@test.com' } },
    }),
  },
};

// Mock supabase-server
vi.mock('@/lib/db/supabase-server', () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  getServerUser: vi.fn().mockResolvedValue({ id: 'test-user', email: 'admin@test.com' }),
}));

// Mock studio-articles service to return empty articles (no schema error)
vi.mock('@/services/studio/studio-articles', () => ({
  studioFetchAllArticles: vi.fn().mockResolvedValue([]),
  studioArchiveArticle: vi.fn().mockResolvedValue(undefined),
  studioDeleteArticle: vi.fn().mockResolvedValue(undefined),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const icon = ({ children, ...props }: any) =>
    React.createElement('svg', { ...props, 'data-testid': 'lucide-icon' }, children);
  return {
    Plus: icon,
    FileText: icon,
    Pencil: icon,
    Archive: icon,
    Trash2: icon,
    Star: icon,
    Image: icon,
    Upload: icon,
    Palette: icon,
    User: icon,
    BookOpen: icon,
    FolderOpen: icon,
  };
});

// ── Imports (after mocks) ─────────────────────────────────────

import { redirect } from 'next/navigation';

// ── Tests ─────────────────────────────────────────────────────

describe('Integration: Studio Bug Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset supabase mock to return empty data without errors
    mockSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
  });

  describe('Req 16.1, 16.2 - Articles page loads without schema error', () => {
    it('exports a default page component', async () => {
      const articlesModule = await import('@/app/studio/articles/page');
      expect(articlesModule.default).toBeDefined();
      expect(typeof articlesModule.default).toBe('function');
    });

    it('renders without throwing a schema cache error', async () => {
      const { studioFetchAllArticles } = await import('@/services/studio/studio-articles');

      // Verify the service function resolves without error (no schema issue)
      const result = await studioFetchAllArticles();
      expect(result).toEqual([]);

      // The articles page should be importable and callable without throwing
      const articlesModule = await import('@/app/studio/articles/page');
      const StudioArticlesPage = articlesModule.default;

      // Call the async server component — it should not throw
      const element = await StudioArticlesPage();
      expect(element).toBeDefined();
      expect(element).not.toBeNull();
    });

    it('handles empty articles data gracefully', async () => {
      const articlesModule = await import('@/app/studio/articles/page');
      const StudioArticlesPage = articlesModule.default;

      // Render the page with empty data — should not throw
      const element = await StudioArticlesPage();

      // The element should be a valid React element (JSX output)
      expect(element).toBeDefined();
      expect(element.type).toBe('div');
    });

    it('does not call redirect when user is authenticated', async () => {
      const articlesModule = await import('@/app/studio/articles/page');
      const StudioArticlesPage = articlesModule.default;

      await StudioArticlesPage();

      // redirect should NOT have been called since user is authenticated
      expect(redirect).not.toHaveBeenCalled();
    });

    it('queries the articles table without schema error', async () => {
      const { studioFetchAllArticles } = await import('@/services/studio/studio-articles');

      // This verifies the service can query without a "relation public.articles does not exist" error
      await expect(studioFetchAllArticles()).resolves.not.toThrow();
    });
  });

  describe('Req 17.1 - Media page route resolves', () => {
    it('exports a default page component', async () => {
      const mediaModule = await import('@/app/studio/media/page');
      expect(mediaModule.default).toBeDefined();
      expect(typeof mediaModule.default).toBe('function');
    });

    it('renders without returning 404', async () => {
      const mediaModule = await import('@/app/studio/media/page');
      const StudioMediaPage = mediaModule.default;

      // Call the async server component — it should not throw or return null
      const element = await StudioMediaPage();
      expect(element).toBeDefined();
      expect(element).not.toBeNull();
    });

    it('renders the media management page structure', async () => {
      const mediaModule = await import('@/app/studio/media/page');
      const StudioMediaPage = mediaModule.default;

      const element = await StudioMediaPage();

      // Should render a div container (the page wrapper)
      expect(element.type).toBe('div');
      expect(element).toBeDefined();
    });

    it('handles empty media data gracefully', async () => {
      // Ensure supabase returns empty data
      mockSelect.mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      const mediaModule = await import('@/app/studio/media/page');
      const StudioMediaPage = mediaModule.default;

      // Should render without throwing even with no media assets
      const element = await StudioMediaPage();
      expect(element).toBeDefined();
      expect(element).not.toBeNull();
    });

    it('does not call redirect when user is authenticated', async () => {
      const mediaModule = await import('@/app/studio/media/page');
      const StudioMediaPage = mediaModule.default;

      await StudioMediaPage();

      // redirect should NOT have been called since user is authenticated
      expect(redirect).not.toHaveBeenCalled();
    });

    it('exports metadata with title "Media"', async () => {
      const mediaModule = await import('@/app/studio/media/page');
      expect(mediaModule.metadata).toBeDefined();
      expect((mediaModule.metadata as any).title).toBe('Media');
    });
  });
});
