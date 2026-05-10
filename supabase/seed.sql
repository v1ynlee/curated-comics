-- ============================================================
-- Seed Data — Comic Curated
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
--         docs/architecture/CONTENT_STRUCTURE.md
--
-- Order: genres → moods → achievements
-- Safe to re-run: uses ON CONFLICT DO NOTHING
-- ============================================================

-- ── Genres ───────────────────────────────────────────────────

INSERT INTO genres (name, slug, color, sort_order) VALUES
  ('Action',        'action',        '#EF4444',  1),
  ('Adventure',     'adventure',     '#F59E0B',  2),
  ('Comedy',        'comedy',        '#FCD34D',  3),
  ('Drama',         'drama',         '#8B5CF6',  4),
  ('Fantasy',       'fantasy',       '#6366F1',  5),
  ('Horror',        'horror',        '#1F2937',  6),
  ('Martial Arts',  'martial-arts',  '#DC2626',  7),
  ('Murim',         'murim',         '#B91C1C',  8),
  ('Mystery',       'mystery',       '#4B5563',  9),
  ('Psychological', 'psychological', '#7C3AED', 10),
  ('Regression',    'regression',    '#2563EB', 11),
  ('Reincarnation', 'reincarnation', '#0EA5E9', 12),
  ('Romance',       'romance',       '#EC4899', 13),
  ('School Life',   'school-life',   '#10B981', 14),
  ('Sci-Fi',        'sci-fi',        '#06B6D4', 15),
  ('Slice of Life', 'slice-of-life', '#34D399', 16),
  ('Sports',        'sports',        '#F97316', 17),
  ('Supernatural',  'supernatural',  '#A855F7', 18),
  ('System',        'system',        '#3B82F6', 19),
  ('Thriller',      'thriller',      '#374151', 20),
  ('Tower',         'tower',         '#6D28D9', 21),
  ('Villainess',    'villainess',    '#BE185D', 22),
  ('Wuxia',         'wuxia',         '#991B1B', 23)
ON CONFLICT (slug) DO NOTHING;

-- ── Moods ─────────────────────────────────────────────────────

INSERT INTO moods (name, slug, description, emoji, atmosphere, sort_order) VALUES
  (
    'Depression Arc',
    'depression-arc',
    'Emotionally devastating reads that hit different',
    '🖤',
    '{"gradient": ["#1a0a0a", "#2d1515"], "accentColor": "#8B0000", "particleColor": "#4a0000"}',
    1
  ),
  (
    'Aura Farming',
    'aura-farming',
    'MC radiates so much presence it''s unreal',
    '✨',
    '{"gradient": ["#0a0a1a", "#1a1a3d"], "accentColor": "#8b5cf6", "particleColor": "#6d28d9"}',
    2
  ),
  (
    'Brainrot',
    'brainrot',
    'Addictive to the point of no return',
    '🧠',
    '{"gradient": ["#0a1a0a", "#1a3d1a"], "accentColor": "#10b981", "particleColor": "#059669"}',
    3
  ),
  (
    'Manipulator MC',
    'manipulator-mc',
    'Chess master protagonists playing 4D chess',
    '🎭',
    '{"gradient": ["#1a0a1a", "#2d152d"], "accentColor": "#ec4899", "particleColor": "#be185d"}',
    4
  ),
  (
    'Comfy Slice of Life',
    'comfy-sol',
    'Warm, cozy, no stress allowed',
    '☕',
    '{"gradient": ["#1a1208", "#2d2010"], "accentColor": "#f59e0b", "particleColor": "#d97706"}',
    5
  ),
  (
    'Revenge Fantasy',
    'revenge-fantasy',
    'Satisfying payback arcs',
    '🔥',
    '{"gradient": ["#1a0800", "#3d1500"], "accentColor": "#ef4444", "particleColor": "#dc2626"}',
    6
  ),
  (
    'Murim Addiction',
    'murim-addiction',
    'Martial arts cultivation crack',
    '⚔️',
    '{"gradient": ["#1a0a00", "#2d1500"], "accentColor": "#b91c1c", "particleColor": "#991b1b"}',
    7
  ),
  (
    'Power Fantasy',
    'power-fantasy',
    'Overpowered MC doing overpowered things',
    '💪',
    '{"gradient": ["#0a0a1a", "#0f1a3d"], "accentColor": "#3b82f6", "particleColor": "#2563eb"}',
    8
  ),
  (
    'Emotional Damage',
    'emotional-damage',
    'Will make you cry in the shower',
    '💔',
    '{"gradient": ["#0a0a1a", "#1a0a2d"], "accentColor": "#7c3aed", "particleColor": "#6d28d9"}',
    9
  ),
  (
    'Villainess Era',
    'villainess-era',
    'Reincarnated as the villain and thriving',
    '👑',
    '{"gradient": ["#1a0a12", "#2d1520"], "accentColor": "#be185d", "particleColor": "#9d174d"}',
    10
  ),
  (
    'Necromancer Vibes',
    'necromancer-vibes',
    'Undead armies and dark magic',
    '💀',
    '{"gradient": ["#080a08", "#101510"], "accentColor": "#4b5563", "particleColor": "#374151"}',
    11
  ),
  (
    'Regression Loop',
    'regression-loop',
    'Time travel do-overs done right',
    '🔄',
    '{"gradient": ["#080a1a", "#0f1530"], "accentColor": "#2563eb", "particleColor": "#1d4ed8"}',
    12
  ),
  (
    'Tower Climbing',
    'tower-climbing',
    'Floor by floor, getting stronger',
    '🗼',
    '{"gradient": ["#0a0a1a", "#15153d"], "accentColor": "#6d28d9", "particleColor": "#5b21b6"}',
    13
  ),
  (
    'System Addict',
    'system-addict',
    'Stat screens and level-up dopamine',
    '📊',
    '{"gradient": ["#080f1a", "#0f1a2d"], "accentColor": "#0ea5e9", "particleColor": "#0284c7"}',
    14
  ),
  (
    'Art So Good It Hurts',
    'art-god',
    'Visual masterpieces',
    '🎨',
    '{"gradient": ["#1a0a1a", "#2d1a2d"], "accentColor": "#e040fb", "particleColor": "#c026d3"}',
    15
  ),
  (
    'Guilty Pleasure Trash',
    'guilty-trash',
    'Objectively bad, subjectively perfect',
    '🗑️',
    '{"gradient": ["#1a1008", "#2d1f0f"], "accentColor": "#f97316", "particleColor": "#ea580c"}',
    16
  )
ON CONFLICT (slug) DO NOTHING;

-- ── Achievements ──────────────────────────────────────────────

INSERT INTO achievements
  (name, slug, description, icon, condition_type, condition_target, condition_filter, rarity, color, glow_effect, sort_order)
VALUES
  -- Reading volume
  (
    'First Steps',
    'first-steps',
    'Add your first title to the library',
    'book-open',
    'count', 1,
    '{"status": "reading"}',
    'common', '#10b981', FALSE, 1
  ),
  (
    'Getting Hooked',
    'getting-hooked',
    'Complete 10 titles',
    'check-circle',
    'count', 10,
    '{"status": "completed"}',
    'common', '#10b981', FALSE, 2
  ),
  (
    'Completionist',
    'completionist',
    'Complete 100 titles',
    'trophy',
    'count', 100,
    '{"status": "completed"}',
    'epic', '#8b5cf6', TRUE, 3
  ),
  (
    'Library Hoarder',
    'library-hoarder',
    'Have 200+ titles in your library',
    'library',
    'count', 200,
    NULL,
    'rare', '#3b82f6', FALSE, 4
  ),
  -- Genre specialists
  (
    'Murim Survivor',
    'murim-survivor',
    'Read 50+ murim titles',
    'sword',
    'genre', 50,
    '{"genre": "murim"}',
    'epic', '#b91c1c', TRUE, 10
  ),
  (
    'Villainess Addict',
    'villainess-addict',
    'Read 30+ villainess titles',
    'crown',
    'genre', 30,
    '{"genre": "villainess"}',
    'rare', '#be185d', FALSE, 11
  ),
  (
    'Regression Veteran',
    'regression-veteran',
    'Read 20+ regression titles',
    'refresh-cw',
    'genre', 20,
    '{"genre": "regression"}',
    'rare', '#2563eb', FALSE, 12
  ),
  (
    'Tower Conqueror',
    'tower-conqueror',
    'Read 15+ tower titles',
    'layers',
    'genre', 15,
    '{"genre": "tower"}',
    'rare', '#6d28d9', FALSE, 13
  ),
  (
    'System Enjoyer',
    'system-enjoyer',
    'Read 25+ system titles',
    'cpu',
    'genre', 25,
    '{"genre": "system"}',
    'rare', '#0ea5e9', FALSE, 14
  ),
  (
    'Romance Connoisseur',
    'romance-connoisseur',
    'Read 20+ romance titles',
    'heart',
    'genre', 20,
    '{"genre": "romance"}',
    'common', '#ec4899', FALSE, 15
  ),
  (
    'Wuxia Wanderer',
    'wuxia-wanderer',
    'Read 15+ wuxia titles',
    'wind',
    'genre', 15,
    '{"genre": "wuxia"}',
    'rare', '#991b1b', FALSE, 16
  ),
  -- Rating achievements
  (
    'Art Connoisseur',
    'art-connoisseur',
    'Rate 10+ titles with a perfect 10 for art',
    'palette',
    'rating', 10,
    '{"dimension": "art", "score": 10}',
    'epic', '#e040fb', TRUE, 20
  ),
  (
    'Harsh Critic',
    'harsh-critic',
    'Drop 10+ titles',
    'x-circle',
    'count', 10,
    '{"status": "dropped"}',
    'common', '#ef4444', FALSE, 21
  ),
  -- Special
  (
    'Speed Reader',
    'speed-reader',
    'Read 1000+ chapters in a single month',
    'zap',
    'streak', 1000,
    '{"period": "month", "metric": "chapters"}',
    'legendary', '#ffd700', TRUE, 30
  ),
  (
    'Genre Hopper',
    'genre-hopper',
    'Read titles across 15+ different genres',
    'shuffle',
    'special', 15,
    '{"metric": "unique_genres"}',
    'epic', '#06b6d4', TRUE, 31
  ),
  (
    'Necromancer Consumer',
    'necromancer-consumer',
    'Read every necromancer title in the library',
    'skull',
    'special', 1,
    '{"metric": "all_in_genre", "genre": "supernatural"}',
    'legendary', '#4b5563', TRUE, 32
  ),
  (
    'Re-reader',
    're-reader',
    'Re-read a title 3+ times',
    'repeat',
    'special', 3,
    '{"metric": "reread_count"}',
    'rare', '#f59e0b', FALSE, 33
  ),
  (
    'Hidden Gem Hunter',
    'hidden-gem-hunter',
    'Mark 5+ titles as Hidden Gems',
    'gem',
    'count', 5,
    '{"status": "hidden-gem"}',
    'rare', '#34d399', FALSE, 34
  )
ON CONFLICT (slug) DO NOTHING;
