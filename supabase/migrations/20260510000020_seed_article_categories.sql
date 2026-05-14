-- Seed default article categories
-- Requirement 14.1: Default categories for the editorial system

INSERT INTO article_categories (id, name, slug, description, color, sort_order)
VALUES
  (gen_random_uuid(), 'Hiatus News', 'hiatus-news', 'Updates on series going on hiatus or returning from breaks', '#F59E0B', 1),
  (gen_random_uuid(), 'Axed Series', 'axed-series', 'Coverage of cancelled or prematurely ended series', '#EF4444', 2),
  (gen_random_uuid(), 'Release Announcements', 'release-announcements', 'New series launches, adaptations, and official release news', '#10B981', 3),
  (gen_random_uuid(), 'Industry Commentary', 'industry-commentary', 'Analysis and discussion of manga/manhwa industry trends', '#6366F1', 4),
  (gen_random_uuid(), 'Recommendations', 'recommendations', 'Curated picks and reading suggestions', '#8B5CF6', 5),
  (gen_random_uuid(), 'Editorials', 'editorials', 'Long-form opinion pieces and deep dives', '#EC4899', 6),
  (gen_random_uuid(), 'Curated Opinions', 'curated-opinions', 'Personal takes and hot takes on series and the community', '#14B8A6', 7)
ON CONFLICT (name) DO NOTHING;
