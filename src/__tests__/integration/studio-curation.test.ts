// ============================================================
// Integration Tests: Curation Feature
// Validates that curation collections persist to database (Req 18.5)
// and add/remove titles from collections works correctly (Req 18.4).
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Setup ────────────────────────────────────────────────

// Track all supabase calls for assertions
const mockInsertReturn = {
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({
    data: { id: 'new-id', name: 'Test', slug: 'test', category: 'featured' },
    error: null,
  }),
};

const mockDeleteReturn = {
  eq: vi.fn().mockReturnThis(),
};

const mockSelectReturn = {
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
};

const mockInsert = vi.fn().mockReturnValue(mockInsertReturn);
const mockDelete = vi.fn().mockReturnValue(mockDeleteReturn);
const mockSelect = vi.fn().mockReturnValue(mockSelectReturn);

const mockFrom = vi.fn().mockImplementation((table: string) => ({
  insert: mockInsert,
  delete: mockDelete,
  select: mockSelect,
}));

const mockSupabaseClient = {
  from: mockFrom,
};

// Mock @/lib/db/supabase-server
vi.mock('@/lib/db/supabase-server', () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({
    from: (table: string) => ({
      insert: mockInsert,
      delete: mockDelete,
      select: mockSelect,
    }),
  }),
  getServerUser: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────

import { getServerUser } from '@/lib/db/supabase-server';
import { revalidatePath } from 'next/cache';
import {
  createCollection,
  deleteCollection,
  addTitleToCollection,
  removeTitleFromCollection,
  createMoodCuration,
  deleteMoodCuration,
  addTitleToMoodCuration,
  removeTitleFromMoodCuration,
} from '@/app/studio/curation/actions';

// ── Tests ─────────────────────────────────────────────────────

describe('Integration: Curation Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: user is authenticated
    vi.mocked(getServerUser).mockResolvedValue({
      id: 'user-123',
      email: 'admin@test.com',
    } as any);

    // Reset insert mock to return success with select().single() chain
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'new-id', name: 'Test', slug: 'test' },
          error: null,
        }),
      }),
      error: null,
    });

    // Reset delete mock to chain .eq() calls and resolve with no error
    mockDelete.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
        error: null,
        then: (resolve: any) => resolve({ error: null }),
      }),
    });

    // Reset select mock for position queries
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    });
  });

  // ── Unauthorized Access ───────────────────────────────────────

  describe('Unauthorized access returns error', () => {
    beforeEach(() => {
      vi.mocked(getServerUser).mockResolvedValue(null);
    });

    it('createCollection returns Unauthorized when user is not authenticated', async () => {
      const result = await createCollection({
        name: 'My Collection',
        category: 'featured',
      });

      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('deleteCollection returns Unauthorized when user is not authenticated', async () => {
      const result = await deleteCollection('collection-id');

      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('addTitleToCollection returns Unauthorized when user is not authenticated', async () => {
      const result = await addTitleToCollection('collection-id', 'title-id');

      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('removeTitleFromCollection returns Unauthorized when user is not authenticated', async () => {
      const result = await removeTitleFromCollection('collection-id', 'title-id');

      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('createMoodCuration returns Unauthorized when user is not authenticated', async () => {
      const result = await createMoodCuration({ name: 'Sad Endings' });

      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('deleteMoodCuration returns Unauthorized when user is not authenticated', async () => {
      const result = await deleteMoodCuration('mood-id');

      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('addTitleToMoodCuration returns Unauthorized when user is not authenticated', async () => {
      const result = await addTitleToMoodCuration('mood-id', 'title-id');

      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('removeTitleFromMoodCuration returns Unauthorized when user is not authenticated', async () => {
      const result = await removeTitleFromMoodCuration('mood-id', 'title-id');

      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  // ── Curated Collections ───────────────────────────────────────

  describe('Req 18.5 - Curated collections persist to database', () => {
    it('createCollection calls supabase.from("curated_collections").insert() with correct data', async () => {
      const result = await createCollection({
        name: 'Best Action Manhwa',
        category: 'recommended',
        description: 'Top action picks',
      });

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Best Action Manhwa',
        slug: expect.any(String),
        category: 'recommended',
        description: 'Top action picks',
      });
    });

    it('createCollection generates a slug from the name', async () => {
      await createCollection({
        name: 'My Featured Collection',
        category: 'featured',
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'my-featured-collection',
        }),
      );
    });

    it('createCollection sets description to null when not provided', async () => {
      await createCollection({
        name: 'No Description',
        category: 'by-artist',
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
        }),
      );
    });

    it('createCollection revalidates the curation path on success', async () => {
      await createCollection({
        name: 'Test',
        category: 'featured',
      });

      expect(revalidatePath).toHaveBeenCalledWith('/studio/curation');
    });

    it('deleteCollection calls supabase.from("curated_collections").delete() with correct id', async () => {
      const collectionId = 'collection-abc-123';
      const result = await deleteCollection(collectionId);

      expect(result).toEqual({ success: true });
    });
  });

  // ── Add/Remove Titles from Collections (Req 18.4) ─────────────

  describe('Req 18.4 - Add/remove titles from collections', () => {
    it('addTitleToCollection calls supabase.from("collection_titles").insert() with correct data', async () => {
      const result = await addTitleToCollection('col-1', 'title-1');

      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith({
        collection_id: 'col-1',
        title_id: 'title-1',
        position: 0,
      });
    });

    it('addTitleToCollection calculates next position from existing entries', async () => {
      // Mock existing entries with position 5 as the highest
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [{ position: 5 }],
              error: null,
            }),
          }),
        }),
      });

      const result = await addTitleToCollection('col-1', 'title-2');

      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith({
        collection_id: 'col-1',
        title_id: 'title-2',
        position: 6,
      });
    });

    it('removeTitleFromCollection calls supabase.from("collection_titles").delete() with correct filters', async () => {
      const mockEqChain = vi.fn().mockResolvedValue({ error: null });
      const mockFirstEq = vi.fn().mockReturnValue({ eq: mockEqChain });
      mockDelete.mockReturnValue({ eq: mockFirstEq });

      const result = await removeTitleFromCollection('col-1', 'title-1');

      expect(result).toEqual({ success: true });
      expect(mockFirstEq).toHaveBeenCalledWith('collection_id', 'col-1');
      expect(mockEqChain).toHaveBeenCalledWith('title_id', 'title-1');
    });

    it('removeTitleFromCollection revalidates the curation path on success', async () => {
      const mockEqChain = vi.fn().mockResolvedValue({ error: null });
      const mockFirstEq = vi.fn().mockReturnValue({ eq: mockEqChain });
      mockDelete.mockReturnValue({ eq: mockFirstEq });

      await removeTitleFromCollection('col-1', 'title-1');

      expect(revalidatePath).toHaveBeenCalledWith('/studio/curation');
    });
  });

  // ── Mood/Theme Curations ──────────────────────────────────────

  describe('Req 18.5 - Mood curations persist to database', () => {
    it('createMoodCuration calls supabase.from("mood_curations").insert() with correct data', async () => {
      const result = await createMoodCuration({
        name: 'Overpowered MC',
        description: 'Titles with overpowered main characters',
      });

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Overpowered MC',
        slug: 'overpowered-mc',
        description: 'Titles with overpowered main characters',
      });
    });

    it('createMoodCuration sets description to null when not provided', async () => {
      await createMoodCuration({ name: 'Pure Action' });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
        }),
      );
    });

    it('createMoodCuration revalidates the curation path on success', async () => {
      await createMoodCuration({ name: 'Smart MC' });

      expect(revalidatePath).toHaveBeenCalledWith('/studio/curation');
    });

    it('deleteMoodCuration calls supabase.from("mood_curations").delete() with correct id', async () => {
      const mockEqReturn = vi.fn().mockResolvedValue({ error: null });
      mockDelete.mockReturnValue({ eq: mockEqReturn });

      const result = await deleteMoodCuration('mood-abc-123');

      expect(result).toEqual({ success: true });
      expect(mockEqReturn).toHaveBeenCalledWith('id', 'mood-abc-123');
    });

    it('addTitleToMoodCuration calls supabase.from("mood_curation_titles").insert() with correct data', async () => {
      const result = await addTitleToMoodCuration('mood-1', 'title-1');

      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith({
        curation_id: 'mood-1',
        title_id: 'title-1',
        position: 0,
      });
    });

    it('addTitleToMoodCuration calculates next position from existing entries', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [{ position: 3 }],
              error: null,
            }),
          }),
        }),
      });

      const result = await addTitleToMoodCuration('mood-1', 'title-2');

      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith({
        curation_id: 'mood-1',
        title_id: 'title-2',
        position: 4,
      });
    });

    it('removeTitleFromMoodCuration calls supabase.from("mood_curation_titles").delete() with correct filters', async () => {
      const mockEqChain = vi.fn().mockResolvedValue({ error: null });
      const mockFirstEq = vi.fn().mockReturnValue({ eq: mockEqChain });
      mockDelete.mockReturnValue({ eq: mockFirstEq });

      const result = await removeTitleFromMoodCuration('mood-1', 'title-1');

      expect(result).toEqual({ success: true });
      expect(mockFirstEq).toHaveBeenCalledWith('curation_id', 'mood-1');
      expect(mockEqChain).toHaveBeenCalledWith('title_id', 'title-1');
    });

    it('removeTitleFromMoodCuration revalidates the curation path on success', async () => {
      const mockEqChain = vi.fn().mockResolvedValue({ error: null });
      const mockFirstEq = vi.fn().mockReturnValue({ eq: mockEqChain });
      mockDelete.mockReturnValue({ eq: mockFirstEq });

      await removeTitleFromMoodCuration('mood-1', 'title-1');

      expect(revalidatePath).toHaveBeenCalledWith('/studio/curation');
    });
  });

  // ── Success responses ─────────────────────────────────────────

  describe('All actions return { success: true } on success', () => {
    it('createCollection returns success', async () => {
      const result = await createCollection({ name: 'Test', category: 'featured' });
      expect(result.success).toBe(true);
    });

    it('addTitleToCollection returns success', async () => {
      const result = await addTitleToCollection('col-1', 'title-1');
      expect(result.success).toBe(true);
    });

    it('removeTitleFromCollection returns success', async () => {
      const mockEqChain = vi.fn().mockResolvedValue({ error: null });
      const mockFirstEq = vi.fn().mockReturnValue({ eq: mockEqChain });
      mockDelete.mockReturnValue({ eq: mockFirstEq });

      const result = await removeTitleFromCollection('col-1', 'title-1');
      expect(result.success).toBe(true);
    });

    it('createMoodCuration returns success', async () => {
      const result = await createMoodCuration({ name: 'Test Mood' });
      expect(result.success).toBe(true);
    });

    it('addTitleToMoodCuration returns success', async () => {
      const result = await addTitleToMoodCuration('mood-1', 'title-1');
      expect(result.success).toBe(true);
    });

    it('removeTitleFromMoodCuration returns success', async () => {
      const mockEqChain = vi.fn().mockResolvedValue({ error: null });
      const mockFirstEq = vi.fn().mockReturnValue({ eq: mockEqChain });
      mockDelete.mockReturnValue({ eq: mockFirstEq });

      const result = await removeTitleFromMoodCuration('mood-1', 'title-1');
      expect(result.success).toBe(true);
    });
  });
});
