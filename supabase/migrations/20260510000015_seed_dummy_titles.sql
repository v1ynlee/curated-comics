-- ============================================================
-- Migration: 015 — Seed 100 dummy manga/manhwa/manhua titles
-- Idempotent: uses ON CONFLICT DO NOTHING throughout
-- ============================================================

-- ── TITLES ───────────────────────────────────────────────────
-- Distribution targets:
--   reading_status : reading(20) completed(40) dropped(10) paused(10)
--                    wishlist(10) top-favorite(5) hidden-gem(5)
--   tier           : SSS+(2) S(5) A(15) B(20) C(20) D(15) F(5) NULL(18)
--   series_status  : ongoing(50) completed(40) hiatus(10)
--   featured       : first 8 titles TRUE, rest FALSE
--   cover_slug     : first 8 titles set, rest NULL

-- ── 1. MANHWA ────────────────────────────────────────────────

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('solo-leveling', 'Solo Leveling', 'manhwa', 'completed', 'top-favorite', 179, 179, 'SSS+', 'A hunter awakens a hidden power and rises to become the strongest in the world.', 'The one that started it all', TRUE, FALSE, 'solo-leveling', '#1a1a2e', NOW() - INTERVAL '5 days', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('tower-of-god', 'Tower of God', 'manhwa', 'ongoing', 'reading', 590, NULL, 'SSS+', 'A young boy enters a mysterious tower to find the girl who was his entire world.', 'Peak fiction no notes', TRUE, FALSE, 'tower-of-god', '#0f0f1a', NOW() - INTERVAL '2 days', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('omniscient-reader', 'Omniscient Reader', 'manhwa', 'completed', 'completed', 551, 551, 'S', 'The last reader of a prophetic novel must live through its events to save the world.', 'Cried at 3am, would do it again', TRUE, FALSE, 'omniscient-reader', '#16213e', NOW() - INTERVAL '14 days', 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('return-mount-hua', 'Return of the Mount Hua Sect', 'manhwa', 'ongoing', 'reading', 180, NULL, 'S', 'A martial arts master reincarnates and must rebuild his sect from scratch.', 'Slow burn that pays off spectacularly', TRUE, FALSE, 'return-mount-hua', '#1a0a2e', NOW() - INTERVAL '1 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('nano-machine', 'Nano Machine', 'manhwa', 'ongoing', 'completed', 230, 230, 'S', 'A nano machine is injected into a young warrior, granting him extraordinary abilities.', 'My comfort read when life gets hard', TRUE, FALSE, 'nano-machine', '#0a1628', NOW() - INTERVAL '30 days', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('second-life-ranker', 'Second Life Ranker', 'manhwa', 'completed', 'completed', 180, 180, 'A', 'A man enters a tower to avenge his twin brother and uncover the truth of his death.', 'The art alone is worth the read', TRUE, FALSE, 'second-life-ranker', '#1a1a2e', NOW() - INTERVAL '60 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('the-beginning-after-the-end', 'The Beginning After the End', 'manhwa', 'ongoing', 'reading', 220, NULL, 'A', 'A powerful king reincarnates into a world of magic and must navigate a new destiny.', 'Chaotic energy from start to finish', TRUE, FALSE, 'the-beginning-after-the-end', '#0f0f1a', NOW() - INTERVAL '3 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('overgeared', 'Overgeared', 'manhwa', 'completed', 'completed', 210, 210, 'A', 'A gamer known for his bad luck discovers a legendary class and rises to the top.', 'The ending destroyed me in the best way', TRUE, FALSE, 'overgeared', '#16213e', NOW() - INTERVAL '90 days', 1)
ON CONFLICT (slug) DO NOTHING;

-- reading_status continues: need 12 more reading, 32 more completed, 10 dropped, 10 paused, 10 wishlist, 4 top-favorite, 5 hidden-gem

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('murim-login', 'Murim Login', 'manhwa', 'ongoing', 'reading', 170, NULL, 'A', 'A modern hunter logs into a murim world and must master martial arts to survive.', 'Guilty pleasure I recommend unironically', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '4 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('eleceed', 'Eleceed', 'manhwa', 'ongoing', 'reading', 260, NULL, 'B', 'A boy with lightning-fast reflexes teams up with a secret agent cat to fight evil.', 'Wholesome chaos with great fights', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '6 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('lookism', 'Lookism', 'manhwa', 'ongoing', 'reading', 450, NULL, 'B', 'An overweight boy wakes up in a handsome body and navigates two very different lives.', 'Social commentary wrapped in action', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '7 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('true-beauty', 'True Beauty', 'manhwa', 'completed', 'completed', 207, 207, 'C', 'A girl who hides behind makeup discovers love and self-acceptance.', 'The romance that got me into manhwa', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '120 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('weak-hero', 'Weak Hero', 'manhwa', 'ongoing', 'reading', 280, NULL, 'A', 'A frail genius uses strategy and ruthlessness to dismantle school bullying hierarchies.', 'Every chapter is a banger', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '2 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('god-of-high-school', 'The God of High School', 'manhwa', 'completed', 'completed', 570, 570, 'B', 'A martial arts tournament escalates into a battle involving gods and ancient powers.', 'The fights are unmatched', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '200 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('noblesse', 'Noblesse', 'manhwa', 'completed', 'completed', 544, 544, 'B', 'A powerful noble awakens after 820 years and adjusts to modern life while protecting humans.', 'Classic for a reason', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '300 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('hardcore-leveling-warrior', 'Hardcore Leveling Warrior', 'manhwa', 'completed', 'completed', 330, 330, 'B', 'The top-ranked player loses everything and must claw his way back to the top.', 'Underrated gem that deserves more love', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '180 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('unordinary', 'Unordinary', 'manhwa', 'ongoing', 'paused', 320, NULL, 'C', 'In a world of superpowers, a seemingly powerless boy hides a dangerous secret.', 'Started strong, still waiting for the payoff', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '365 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('villain-to-kill', 'Villain to Kill', 'manhwa', 'ongoing', 'reading', 120, NULL, 'B', 'A hero reincarnates as a villain and must navigate a world that sees him as the enemy.', 'Fresh take on the villain protagonist trope', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '10 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('mercenary-enrollment', 'Mercenary Enrollment', 'manhwa', 'ongoing', 'reading', 190, NULL, 'B', 'A teenage mercenary returns home after years of war and tries to live a normal school life.', 'Wholesome action that hits different', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '5 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('reaper-drifting-moon', 'Reaper of the Drifting Moon', 'manhwa', 'ongoing', 'reading', 100, NULL, 'C', 'A man is transported to the murim world and must survive using his wits and hidden talent.', 'Solid murim entry point', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '8 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('volcanic-age', 'Volcanic Age', 'manhwa', 'completed', 'completed', 240, 240, 'C', 'A martial artist regresses to his youth and uses future knowledge to become the strongest.', 'Regression done right', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '150 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('absolute-sword-sense', 'Absolute Sword Sense', 'manhwa', 'ongoing', 'reading', 130, NULL, 'C', 'A warrior with no talent gains the ability to hear the voices of swords.', 'Unique power system that keeps you hooked', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '12 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('descent-demon-master', 'Descent of the Demon Master', 'manhwa', 'ongoing', 'completed', 160, 160, 'B', 'A man reincarnates into a murim world and rises as the demon master.', 'Power fantasy done with actual depth', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '100 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('heavenly-demon-reborn', 'Heavenly Demon Reborn', 'manhwa', 'ongoing', 'paused', 140, NULL, 'C', 'The heavenly demon reincarnates and must reclaim his former glory in a changed world.', 'Good but needs more time to cook', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '200 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('infinite-leveling-murim', 'Infinite Leveling Murim', 'manhwa', 'ongoing', 'wishlist', 50, NULL, 'D', 'A modern man enters a murim game and must level up to survive.', 'On the list, getting to it eventually', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '400 days', 0)
ON CONFLICT (slug) DO NOTHING;


-- ── 2. MANHUA ────────────────────────────────────────────────

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('martial-peak', 'Martial Peak', 'manhua', 'completed', 'completed', 3462, 3462, 'B', 'A sweeper at a martial arts sect discovers a black book and begins his journey to the peak.', 'The longest grind that somehow stays fun', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '60 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('battle-through-heavens', 'Battle Through the Heavens', 'manhua', 'completed', 'completed', 500, 500, 'C', 'A genius who lost his powers must claw his way back to the top of the cultivation world.', 'Classic xianxia that defined the genre', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '400 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('apotheosis', 'Apotheosis', 'manhua', 'completed', 'completed', 1100, 1100, 'C', 'A young man whose sister is held hostage enters a sect and discovers a world-shaking secret.', 'Insane power scaling that never stops', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '180 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('tales-demons-gods', 'Tales of Demons and Gods', 'manhua', 'ongoing', 'paused', 450, NULL, 'C', 'A cultivator regresses to his youth and uses future knowledge to prevent a catastrophe.', 'The OG regression manhua', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '500 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('peerless-dad', 'Peerless Dad', 'manhua', 'ongoing', 'hidden-gem', 320, NULL, 'A', 'A powerful warrior retires to raise his triplets and gets dragged back into the martial world.', 'Dad energy plus insane fights, perfect combo', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '45 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('against-the-gods', 'Against the Gods', 'manhua', 'ongoing', 'dropped', 1900, NULL, 'D', 'A man with a powerful treasure falls off a cliff and reincarnates in a weaker body.', 'Started great, lost the plot around chapter 800', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '600 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('chaotic-sword-god', 'Chaotic Sword God', 'manhua', 'completed', 'dropped', 800, 800, 'D', 'A martial artist reincarnates and wields a chaotic sword to dominate the cultivation world.', 'Dropped it but respect the hustle', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '700 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('rebirth-urban-immortal', 'Rebirth of the Urban Immortal Cultivator', 'manhua', 'completed', 'completed', 700, 700, 'C', 'An immortal cultivator reincarnates in modern times and rebuilds his power from scratch.', 'Urban cultivation at its most satisfying', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '250 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('versatile-mage', 'Versatile Mage', 'manhua', 'ongoing', 'paused', 600, NULL, 'C', 'A student discovers he can use all types of magic in a world where most can only use one.', 'Solid but the pacing drags mid-series', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '300 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('legendary-mechanic', 'The Legendary Mechanic', 'manhua', 'completed', 'completed', 748, 748, 'A', 'A game developer reincarnates as an NPC and uses his knowledge to become legendary.', 'The meta-gaming angle is genius', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '90 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('demons-diary', 'Demon Diary', 'manhua', 'completed', 'completed', 100, 100, 'B', 'A young man is chosen as a demon lord candidate and must learn to embrace his dark destiny.', 'Short and sweet, perfect length', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '350 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('stellar-transformation', 'Stellar Transformation', 'manhua', 'completed', 'wishlist', 40, 40, 'D', 'A boy unable to practice internal energy trains his body to the extreme instead.', 'On the backlog, heard good things', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '800 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('coiling-dragon', 'Coiling Dragon', 'manhua', 'completed', 'completed', 806, 806, 'B', 'A young man trains in a magical world and discovers his connection to a legendary dragon.', 'The novel was better but the manhua slaps', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '400 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('desolate-era', 'Desolate Era', 'manhua', 'completed', 'wishlist', 20, NULL, 'D', 'A boy reincarnates in an ancient era and trains to become a powerful cultivator.', 'Heard it is a slow burn masterpiece', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '900 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('i-shall-seal-heavens', 'I Shall Seal the Heavens', 'manhua', 'completed', 'completed', 1614, 1614, 'A', 'A failed scholar enters the world of cultivation and vows to seal the heavens themselves.', 'The ending is genuinely legendary', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '200 days', 0)
ON CONFLICT (slug) DO NOTHING;


-- ── 3. MANGA ─────────────────────────────────────────────────

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('one-piece', 'One Piece', 'manga', 'ongoing', 'reading', 1110, NULL, 'SSS+', 'A boy with rubber powers sets sail to find the legendary treasure and become King of the Pirates.', 'The greatest story ever told, I will die on this hill', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '1 days', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('berserk', 'Berserk', 'manga', 'hiatus', 'top-favorite', 374, NULL, 'SSS+', 'A lone mercenary branded for death fights demons and gods in a dark medieval world.', 'The gold standard of dark fantasy manga', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '7 days', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('vagabond', 'Vagabond', 'manga', 'hiatus', 'top-favorite', 327, NULL, 'S', 'The fictionalized journey of Miyamoto Musashi as he seeks to become the greatest swordsman.', 'The art is a religious experience', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '14 days', 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('vinland-saga', 'Vinland Saga', 'manga', 'ongoing', 'reading', 210, NULL, 'S', 'A young Viking seeks revenge for his father while questioning the meaning of a true warrior.', 'The farm arc haters were wrong', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '3 days', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('fullmetal-alchemist', 'Fullmetal Alchemist', 'manga', 'completed', 'completed', 108, 108, 'S', 'Two brothers use alchemy to search for the Philosopher Stone after a failed resurrection.', 'Perfect from chapter one to the last page', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '500 days', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('hunter-x-hunter', 'Hunter x Hunter', 'manga', 'hiatus', 'top-favorite', 400, NULL, 'SSS+', 'A boy becomes a Hunter to find his missing father and discovers a world of danger and wonder.', 'Worth every year of waiting', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '30 days', 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('demon-slayer', 'Demon Slayer', 'manga', 'completed', 'completed', 205, 205, 'A', 'A boy becomes a demon slayer to cure his sister and avenge his family.', 'The Mugen Train arc broke me', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '300 days', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('jujutsu-kaisen', 'Jujutsu Kaisen', 'manga', 'ongoing', 'reading', 260, NULL, 'A', 'A boy swallows a cursed finger and enters the world of jujutsu sorcerers.', 'The Culling Game arc is unhinged in the best way', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '2 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('chainsaw-man', 'Chainsaw Man', 'manga', 'ongoing', 'reading', 180, NULL, 'A', 'A broke devil hunter merges with his chainsaw devil and joins a government agency.', 'Nothing else reads like this', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '4 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('spy-x-family', 'Spy x Family', 'manga', 'ongoing', 'reading', 110, NULL, 'A', 'A spy, an assassin, and a telepath form a fake family that becomes surprisingly real.', 'Anya carries every chapter effortlessly', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '5 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('blue-lock', 'Blue Lock', 'manga', 'ongoing', 'reading', 280, NULL, 'A', 'Three hundred strikers compete in a brutal program to forge the world greatest egoist forward.', 'Sports manga that transcends sports manga', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '3 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('kaiju-no-8', 'Kaiju No. 8', 'manga', 'ongoing', 'reading', 120, NULL, 'B', 'A man who dreams of joining the defense force transforms into a kaiju himself.', 'The transformation scenes are insane', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '6 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('dungeon-meshi', 'Dungeon Meshi', 'manga', 'completed', 'completed', 97, 97, 'S', 'Adventurers explore a dungeon and cook the monsters they defeat to survive.', 'The most creative manga of its generation', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '60 days', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('frieren-beyond-journeys-end', 'Frieren Beyond Journey End', 'manga', 'ongoing', 'reading', 130, NULL, 'S', 'An elven mage reflects on a lifetime of adventures after her companions have grown old and died.', 'Made me cry about an elf I met 10 pages ago', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '2 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('oshi-no-ko', 'Oshi no Ko', 'manga', 'ongoing', 'reading', 160, NULL, 'A', 'A doctor reincarnates as the child of his idol and uncovers the dark side of the entertainment industry.', 'The first chapter is a masterpiece of setup', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '4 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('mushoku-tensei', 'Mushoku Tensei', 'manga', 'ongoing', 'completed', 90, 90, 'B', 'A jobless man reincarnates in a fantasy world and vows to live without regrets.', 'The isekai that made isekai serious again', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '120 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('slime-reincarnation', 'That Time I Got Reincarnated as a Slime', 'manga', 'ongoing', 'completed', 120, 120, 'B', 'A man reincarnates as a slime and builds a nation of monsters through diplomacy and power.', 'Nation-building isekai done right', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '150 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('overlord', 'Overlord', 'manga', 'ongoing', 'completed', 80, 80, 'B', 'A player trapped in a game as a skeleton overlord decides to conquer the new world.', 'Villain protagonist done with actual menace', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '180 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('re-zero', 'Re Zero', 'manga', 'ongoing', 'paused', 70, NULL, 'B', 'A boy transported to a fantasy world discovers he can return from death, but at a cost.', 'The suffering is the point and it works', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '250 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('eminence-in-shadow', 'The Eminence in Shadow', 'manga', 'ongoing', 'completed', 80, 80, 'B', 'A boy obsessed with being a shadow mastermind accidentally creates a real secret organization.', 'Parody that became the thing it was parodying', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '200 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('classroom-of-the-elite', 'Classroom of the Elite', 'manga', 'ongoing', 'paused', 60, NULL, 'C', 'A genius student hides his true abilities in a school where class rank determines everything.', 'The mind games are genuinely clever', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '300 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('villainess-level-99', 'Villainess Level 99', 'manga', 'ongoing', 'wishlist', 30, NULL, 'C', 'A girl reincarnates as the villainess and grinds levels to avoid her bad ending.', 'The grinding angle is hilarious', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '600 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('villainess-taming-final-boss', 'Villainess Taming the Final Boss', 'manga', 'ongoing', 'wishlist', 25, NULL, 'C', 'A villainess reincarnate tries to tame the demon lord to avoid her execution ending.', 'The dynamic between them is everything', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '700 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('my-next-life-villainess', 'My Next Life as a Villainess', 'manga', 'completed', 'completed', 80, 80, 'C', 'A girl reincarnates as the villainess and tries to avoid all her doom flags.', 'Catarina is the most chaotic protagonist ever', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '350 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('reincarnated-as-sword', 'Reincarnated as the Sword', 'manga', 'ongoing', 'wishlist', 15, NULL, 'D', 'A man reincarnates as a sword and bonds with a young beastgirl adventurer.', 'Unique premise, on the list', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '800 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('tensei-slime', 'Tensei Shitara Slime Datta Ken', 'manga', 'ongoing', 'completed', 110, 110, 'B', 'The original slime reincarnation story that spawned a genre.', 'The manga that started the slime trend', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '160 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('sword-art-online', 'Sword Art Online', 'manga', 'completed', 'dropped', 50, 50, 'F', 'Players are trapped in a VR game where death is real.', 'The first arc was peak, then it happened', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '1000 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('no-game-no-life', 'No Game No Life', 'manga', 'hiatus', 'wishlist', 10, NULL, 'C', 'Genius gamer siblings are transported to a world where everything is decided by games.', 'The anime was enough honestly', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '900 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('konosuba', 'Konosuba', 'manga', 'completed', 'completed', 80, 80, 'B', 'A boy chooses a useless goddess as his cheat item and they form the most dysfunctional party.', 'The comedy never misses, ever', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '280 days', 0)
ON CONFLICT (slug) DO NOTHING;


-- ── 4. MANHWA (continued — villainess / romance / regression) ─

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('villainess-reverses-hourglass', 'The Villainess Reverses the Hourglass', 'manhwa', 'completed', 'completed', 120, 120, 'A', 'A villainess uses a magical hourglass to go back in time and take revenge on her sister.', 'The revenge arc is deeply satisfying', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '80 days', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('beware-of-the-villainess', 'Beware of the Villainess', 'manhwa', 'completed', 'hidden-gem', 100, 100, 'A', 'A modern girl reincarnates as the villainess and refuses to play by the romance novel rules.', 'The most feminist villainess manhwa out there', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '100 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('abandoned-empress', 'The Abandoned Empress', 'manhwa', 'completed', 'completed', 130, 130, 'B', 'A noble girl regresses to prevent her tragic fate as the abandoned empress.', 'The emotional gut punches are relentless', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '200 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('who-made-me-princess', 'Who Made Me a Princess', 'manhwa', 'completed', 'completed', 130, 130, 'A', 'A woman reincarnates as a princess doomed to be killed by her father and tries to survive.', 'The father-daughter dynamic will wreck you', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '150 days', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('raeliana-dukes-mansion', 'The Reason Why Raeliana Ended Up at the Dukes Mansion', 'manhwa', 'completed', 'completed', 130, 130, 'B', 'A girl reincarnates as a side character destined to die and schemes to survive using the duke.', 'The banter between leads is top tier', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '220 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('remarried-empress', 'Remarried Empress', 'manhwa', 'ongoing', 'reading', 160, NULL, 'A', 'An empress is abandoned by her emperor husband and must navigate a new marriage and power.', 'The queen behavior is immaculate', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '5 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('doctor-elise', 'Doctor Elise The Royal Lady with the Lamp', 'manhwa', 'completed', 'completed', 130, 130, 'B', 'A surgeon reincarnates as a villainess princess and uses modern medicine to change her fate.', 'Medical knowledge as a superpower is inspired', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '280 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('empress-another-world', 'Empress of Another World', 'manhwa', 'completed', 'dropped', 80, 80, 'D', 'A modern woman is transported to a fantasy empire and must survive palace intrigue.', 'Had potential but lost me halfway', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '500 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('duchess-empty-soul', 'The Duchess with an Empty Soul', 'manhwa', 'ongoing', 'hidden-gem', 90, NULL, 'B', 'A woman with no emotions reincarnates as a duchess and slowly learns to feel again.', 'The character development is genuinely moving', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '40 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('villain-mother', 'I Became the Villains Mother', 'manhwa', 'ongoing', 'completed', 100, 100, 'B', 'A woman reincarnates as the villain mother and tries to raise her son away from his dark fate.', 'The mom energy is off the charts', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '130 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('tyrant-tranquilizer', 'The Tyrants Tranquilizer', 'manhwa', 'ongoing', 'hidden-gem', 80, NULL, 'B', 'A woman reincarnates as a side character and becomes the only one who can calm the tyrant emperor.', 'The slow burn romance is exquisite', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '25 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('omniscient-readers-viewpoint', 'Omniscient Readers Viewpoint', 'manhwa', 'completed', 'completed', 551, 551, 'S', 'An alternate adaptation of the Omniscient Reader story with expanded scenes.', 'Every reread reveals something new', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '20 days', 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('returners-magic-special', 'A Returners Magic Should Be Special', 'manhwa', 'ongoing', 'completed', 230, 230, 'A', 'A mage who survived the shadow labyrinth returns to the past to prevent the catastrophe.', 'The magic system is one of the best', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '70 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('max-level-hero-returned', 'The Max Level Hero Has Returned', 'manhwa', 'ongoing', 'completed', 150, 150, 'B', 'A prince who was comatose had his soul training in another world for a thousand years.', 'The gap between expectation and reality is comedy gold', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '110 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('dungeon-reset', 'Dungeon Reset', 'manhwa', 'ongoing', 'completed', 280, 280, 'B', 'A man is left behind in a dungeon reset and discovers he is immune to the reset mechanic.', 'The crafting and survival loop is addictive', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '95 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('tutorial-too-hard', 'The Tutorial Is Too Hard', 'manhwa', 'ongoing', 'completed', 200, 200, 'A', 'A man chooses the hardest difficulty in a tutorial and gets stuck there for years.', 'The tutorial arc is longer than most series', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '85 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('skeleton-soldier', 'Skeleton Soldier', 'manhwa', 'completed', 'completed', 330, 330, 'A', 'A skeleton soldier dies repeatedly and uses each life to grow stronger and protect his master.', 'The lore payoff is absolutely worth it', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '140 days', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('trash-counts-family', 'Trash of the Counts Family', 'manhwa', 'ongoing', 'reading', 800, NULL, 'A', 'A man reincarnates as a trash noble in a novel and tries to live a comfortable lazy life.', 'The longest running manhwa I actually keep up with', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '1 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('novels-extra', 'The Novels Extra', 'manhwa', 'completed', 'completed', 310, 310, 'A', 'A writer wakes up inside his own novel as a background character and must survive.', 'Meta storytelling done with genuine heart', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '170 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('regressor-instruction-manual', 'Regressor Instruction Manual', 'manhwa', 'ongoing', 'reading', 90, NULL, 'B', 'A non-combatant uses a regressor as a tool to survive the apocalypse.', 'The most cynical protagonist in the genre', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '9 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('s-classes-i-raised', 'The S-Classes That I Raised', 'manhwa', 'ongoing', 'completed', 200, 200, 'A', 'A F-rank hunter with a broken skill raises S-rank hunters and watches them grow.', 'The found family aspect hits hard', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '115 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('sword-prodigy', 'Sword Prodigy', 'manhwa', 'ongoing', 'wishlist', 40, NULL, 'D', 'A young noble reincarnates with memories of being a legendary swordsman.', 'Heard it picks up after chapter 50', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '700 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('reincarnation-suicidal-battle-god', 'Reincarnation of the Suicidal Battle God', 'manhwa', 'ongoing', 'completed', 180, 180, 'B', 'A warrior who died fighting demons alone reincarnates and vows to build allies this time.', 'The redemption arc is earned', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '135 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('chronicles-martial-god-return', 'Chronicles of the Martial Gods Return', 'manhwa', 'ongoing', 'reading', 110, NULL, 'C', 'The greatest martial god reincarnates in the modern world and must adapt to a changed era.', 'Classic regression with a modern twist', FALSE, FALSE, NULL, '#16213e', NOW() - INTERVAL '11 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('fist-demon-mount-hua', 'Fist Demon of Mount Hua', 'manhwa', 'ongoing', 'dropped', 60, NULL, 'F', 'A demon fist master reincarnates at Mount Hua and must hide his true nature.', 'Dropped early, did not click with me', FALSE, FALSE, NULL, '#1a0a2e', NOW() - INTERVAL '600 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('i-love-yoo', 'I Love Yoo', 'manhwa', 'hiatus', 'paused', 280, NULL, 'B', 'A girl who avoids emotional connections gets entangled with two brothers and must confront her past.', 'The hiatus is painful because it was so good', FALSE, FALSE, NULL, '#0a1628', NOW() - INTERVAL '400 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('lore-olympus', 'Lore Olympus', 'manhwa', 'completed', 'completed', 300, 300, 'B', 'A modern retelling of the Hades and Persephone myth with stunning pastel art.', 'The art style is unlike anything else in the medium', FALSE, FALSE, NULL, '#1a1a2e', NOW() - INTERVAL '90 days', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO titles (slug, title_english, origin, series_status, reading_status, chapters_read, total_chapters, tier, synopsis, vibe_check, featured, hidden, cover_slug, dominant_color, last_read_date, reread_count)
VALUES ('regression-instruction-manual', 'Regression Instruction Manual', 'manhwa', 'ongoing', 'dropped', 40, NULL, 'F', 'A man uses a manual left by a regressor to survive an apocalyptic world.', 'Too similar to others in the genre to stand out', FALSE, FALSE, NULL, '#0f0f1a', NOW() - INTERVAL '650 days', 0)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- GENRE ASSOCIATIONS
-- Uses subquery pattern: SELECT t.id, g.id FROM titles t, genres g
-- WHERE t.slug = '...' AND g.slug = '...'
-- ON CONFLICT DO NOTHING for idempotency
-- ============================================================

-- ── murim / martial-arts ─────────────────────────────────────
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'murim-login' AND g.slug = 'murim' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'return-mount-hua' AND g.slug = 'murim' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'nano-machine' AND g.slug = 'murim' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'volcanic-age' AND g.slug = 'murim' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'absolute-sword-sense' AND g.slug = 'murim' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'descent-demon-master' AND g.slug = 'murim' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'heavenly-demon-reborn' AND g.slug = 'murim' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'infinite-leveling-murim' AND g.slug = 'murim' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'fist-demon-mount-hua' AND g.slug = 'murim' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'chronicles-martial-god-return' AND g.slug = 'murim' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'reaper-drifting-moon' AND g.slug = 'murim' ON CONFLICT DO NOTHING;

-- ── action ───────────────────────────────────────────────────
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'solo-leveling' AND g.slug = 'action' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'tower-of-god' AND g.slug = 'action' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'second-life-ranker' AND g.slug = 'action' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'overgeared' AND g.slug = 'action' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'god-of-high-school' AND g.slug = 'action' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'weak-hero' AND g.slug = 'action' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'mercenary-enrollment' AND g.slug = 'action' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'villain-to-kill' AND g.slug = 'action' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'eleceed' AND g.slug = 'action' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'hardcore-leveling-warrior' AND g.slug = 'action' ON CONFLICT DO NOTHING;

-- ── romance ──────────────────────────────────────────────────
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'true-beauty' AND g.slug = 'romance' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'i-love-yoo' AND g.slug = 'romance' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'lore-olympus' AND g.slug = 'romance' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'remarried-empress' AND g.slug = 'romance' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'abandoned-empress' AND g.slug = 'romance' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'who-made-me-princess' AND g.slug = 'romance' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'raeliana-dukes-mansion' AND g.slug = 'romance' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'doctor-elise' AND g.slug = 'romance' ON CONFLICT DO NOTHING;

-- ── villainess ───────────────────────────────────────────────
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'villainess-reverses-hourglass' AND g.slug = 'villainess' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'beware-of-the-villainess' AND g.slug = 'villainess' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'villainess-level-99' AND g.slug = 'villainess' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'villainess-taming-final-boss' AND g.slug = 'villainess' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'my-next-life-villainess' AND g.slug = 'villainess' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'duchess-empty-soul' AND g.slug = 'villainess' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'villain-mother' AND g.slug = 'villainess' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'tyrant-tranquilizer' AND g.slug = 'villainess' ON CONFLICT DO NOTHING;

-- ── fantasy ──────────────────────────────────────────────────
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'the-beginning-after-the-end' AND g.slug = 'fantasy' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'omniscient-reader' AND g.slug = 'fantasy' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'berserk' AND g.slug = 'fantasy' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'vagabond' AND g.slug = 'fantasy' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'frieren-beyond-journeys-end' AND g.slug = 'fantasy' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'dungeon-meshi' AND g.slug = 'fantasy' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'mushoku-tensei' AND g.slug = 'fantasy' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'overlord' AND g.slug = 'fantasy' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 're-zero' AND g.slug = 'fantasy' ON CONFLICT DO NOTHING;

-- ── system ───────────────────────────────────────────────────
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'solo-leveling' AND g.slug = 'system' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'second-life-ranker' AND g.slug = 'system' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'tutorial-too-hard' AND g.slug = 'system' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'dungeon-reset' AND g.slug = 'system' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'skeleton-soldier' AND g.slug = 'system' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'max-level-hero-returned' AND g.slug = 'system' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'returners-magic-special' AND g.slug = 'system' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 's-classes-i-raised' AND g.slug = 'system' ON CONFLICT DO NOTHING;

-- ── tower ────────────────────────────────────────────────────
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'tower-of-god' AND g.slug = 'tower' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'tutorial-too-hard' AND g.slug = 'tower' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'dungeon-reset' AND g.slug = 'tower' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'skeleton-soldier' AND g.slug = 'tower' ON CONFLICT DO NOTHING;

-- ── regression ───────────────────────────────────────────────
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'regressor-instruction-manual' AND g.slug = 'regression' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'regression-instruction-manual' AND g.slug = 'regression' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'reincarnation-suicidal-battle-god' AND g.slug = 'regression' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'omniscient-readers-viewpoint' AND g.slug = 'regression' ON CONFLICT DO NOTHING;

-- ── wuxia ────────────────────────────────────────────────────
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'martial-peak' AND g.slug = 'wuxia' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'battle-through-heavens' AND g.slug = 'wuxia' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'apotheosis' AND g.slug = 'wuxia' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'tales-demons-gods' AND g.slug = 'wuxia' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'against-the-gods' AND g.slug = 'wuxia' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'chaotic-sword-god' AND g.slug = 'wuxia' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'stellar-transformation' AND g.slug = 'wuxia' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'coiling-dragon' AND g.slug = 'wuxia' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'desolate-era' AND g.slug = 'wuxia' ON CONFLICT DO NOTHING;
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g WHERE t.slug = 'i-shall-seal-heavens' AND g.slug = 'wuxia' ON CONFLICT DO NOTHING;


-- ============================================================
-- RATINGS
-- Insert for titles with reading_status IN:
--   completed, top-favorite, hidden-gem, most-reread
-- overall range: 7.0 – 9.5  |  other dimensions: 6.5 – 9.5
-- ending only set when series_status = 'completed'
-- ============================================================

-- solo-leveling (completed / top-favorite, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.5, 9.0, 9.5, 9.0, 9.0, 8.5 FROM titles t WHERE t.slug = 'solo-leveling'
ON CONFLICT (title_id) DO NOTHING;

-- omniscient-reader (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.5, 9.5, 8.5, 9.5, 9.0, 9.5 FROM titles t WHERE t.slug = 'omniscient-reader'
ON CONFLICT (title_id) DO NOTHING;

-- nano-machine (completed, series ongoing — no ending score)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 7.5, 8.0, 8.0, 8.5, NULL FROM titles t WHERE t.slug = 'nano-machine'
ON CONFLICT (title_id) DO NOTHING;

-- second-life-ranker (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.0, 8.5, 8.5, 8.0, 8.0 FROM titles t WHERE t.slug = 'second-life-ranker'
ON CONFLICT (title_id) DO NOTHING;

-- overgeared (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.0, 8.0, 8.5, 7.5, 8.5 FROM titles t WHERE t.slug = 'overgeared'
ON CONFLICT (title_id) DO NOTHING;

-- true-beauty (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.5, 8.0, 8.5, 7.0, 7.0, 7.5 FROM titles t WHERE t.slug = 'true-beauty'
ON CONFLICT (title_id) DO NOTHING;

-- god-of-high-school (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.5, 7.0, 9.0, 7.0, 8.0, 7.0 FROM titles t WHERE t.slug = 'god-of-high-school'
ON CONFLICT (title_id) DO NOTHING;

-- noblesse (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.5, 7.5, 7.5, 7.5, 7.0, 7.5 FROM titles t WHERE t.slug = 'noblesse'
ON CONFLICT (title_id) DO NOTHING;

-- hardcore-leveling-warrior (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 8.0, 8.0, 8.0, 7.5, 8.0 FROM titles t WHERE t.slug = 'hardcore-leveling-warrior'
ON CONFLICT (title_id) DO NOTHING;

-- volcanic-age (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.5, 7.0, 7.5, 7.5, 7.5, 7.5 FROM titles t WHERE t.slug = 'volcanic-age'
ON CONFLICT (title_id) DO NOTHING;

-- descent-demon-master (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 7.5, 8.0, 8.0, 8.0, NULL FROM titles t WHERE t.slug = 'descent-demon-master'
ON CONFLICT (title_id) DO NOTHING;

-- martial-peak (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.5, 7.0, 7.5, 7.5, 6.5, 7.5 FROM titles t WHERE t.slug = 'martial-peak'
ON CONFLICT (title_id) DO NOTHING;

-- battle-through-heavens (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.0, 7.0, 7.5, 7.0, 7.0, 7.0 FROM titles t WHERE t.slug = 'battle-through-heavens'
ON CONFLICT (title_id) DO NOTHING;

-- apotheosis (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.0, 6.5, 8.0, 7.0, 7.0, 7.0 FROM titles t WHERE t.slug = 'apotheosis'
ON CONFLICT (title_id) DO NOTHING;

-- peerless-dad (hidden-gem, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 9.0, 8.0, 8.5, 8.5, NULL FROM titles t WHERE t.slug = 'peerless-dad'
ON CONFLICT (title_id) DO NOTHING;

-- rebirth-urban-immortal (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.5, 7.0, 7.5, 7.5, 7.5, 7.5 FROM titles t WHERE t.slug = 'rebirth-urban-immortal'
ON CONFLICT (title_id) DO NOTHING;

-- legendary-mechanic (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.0, 8.0, 8.5, 8.5, 8.5 FROM titles t WHERE t.slug = 'legendary-mechanic'
ON CONFLICT (title_id) DO NOTHING;

-- demons-diary (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 7.5, 8.5, 8.0, 8.0, 8.0 FROM titles t WHERE t.slug = 'demons-diary'
ON CONFLICT (title_id) DO NOTHING;

-- coiling-dragon (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.5, 7.5, 7.5, 7.5, 7.0, 7.5 FROM titles t WHERE t.slug = 'coiling-dragon'
ON CONFLICT (title_id) DO NOTHING;

-- i-shall-seal-heavens (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.5, 8.0, 8.5, 8.0, 9.0 FROM titles t WHERE t.slug = 'i-shall-seal-heavens'
ON CONFLICT (title_id) DO NOTHING;

-- fullmetal-alchemist (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.5, 9.5, 9.0, 9.5, 9.0, 9.5 FROM titles t WHERE t.slug = 'fullmetal-alchemist'
ON CONFLICT (title_id) DO NOTHING;

-- demon-slayer (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.5, 9.5, 8.0, 8.0, 8.0 FROM titles t WHERE t.slug = 'demon-slayer'
ON CONFLICT (title_id) DO NOTHING;

-- dungeon-meshi (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.5, 9.0, 9.0, 9.5, 9.5, 9.5 FROM titles t WHERE t.slug = 'dungeon-meshi'
ON CONFLICT (title_id) DO NOTHING;

-- mushoku-tensei (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 8.0, 8.0, 8.0, 7.5, NULL FROM titles t WHERE t.slug = 'mushoku-tensei'
ON CONFLICT (title_id) DO NOTHING;

-- slime-reincarnation (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 7.5, 8.0, 8.0, 8.0, NULL FROM titles t WHERE t.slug = 'slime-reincarnation'
ON CONFLICT (title_id) DO NOTHING;

-- overlord (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 7.5, 7.5, 8.5, 7.5, NULL FROM titles t WHERE t.slug = 'overlord'
ON CONFLICT (title_id) DO NOTHING;

-- eminence-in-shadow (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 7.5, 8.0, 7.5, 8.5, NULL FROM titles t WHERE t.slug = 'eminence-in-shadow'
ON CONFLICT (title_id) DO NOTHING;

-- my-next-life-villainess (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5 FROM titles t WHERE t.slug = 'my-next-life-villainess'
ON CONFLICT (title_id) DO NOTHING;

-- villainess-reverses-hourglass (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.5, 8.5, 8.5, 8.0, 8.5 FROM titles t WHERE t.slug = 'villainess-reverses-hourglass'
ON CONFLICT (title_id) DO NOTHING;

-- beware-of-the-villainess (hidden-gem, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.0, 8.5, 8.5, 8.5, 8.5 FROM titles t WHERE t.slug = 'beware-of-the-villainess'
ON CONFLICT (title_id) DO NOTHING;

-- abandoned-empress (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 8.5, 8.5, 8.0, 7.5, 8.0 FROM titles t WHERE t.slug = 'abandoned-empress'
ON CONFLICT (title_id) DO NOTHING;

-- who-made-me-princess (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 9.0, 9.0, 8.5, 8.5, 8.5 FROM titles t WHERE t.slug = 'who-made-me-princess'
ON CONFLICT (title_id) DO NOTHING;

-- raeliana-dukes-mansion (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 8.0, 8.5, 8.0, 8.0, 8.0 FROM titles t WHERE t.slug = 'raeliana-dukes-mansion'
ON CONFLICT (title_id) DO NOTHING;

-- doctor-elise (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 8.0, 8.5, 8.0, 8.0, 8.0 FROM titles t WHERE t.slug = 'doctor-elise'
ON CONFLICT (title_id) DO NOTHING;

-- duchess-empty-soul (hidden-gem, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 8.5, 8.5, 8.0, 8.0, NULL FROM titles t WHERE t.slug = 'duchess-empty-soul'
ON CONFLICT (title_id) DO NOTHING;

-- villain-mother (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 8.5, 8.5, 8.0, 8.0, NULL FROM titles t WHERE t.slug = 'villain-mother'
ON CONFLICT (title_id) DO NOTHING;

-- tyrant-tranquilizer (hidden-gem, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 8.5, 8.5, 8.0, 7.5, NULL FROM titles t WHERE t.slug = 'tyrant-tranquilizer'
ON CONFLICT (title_id) DO NOTHING;

-- omniscient-readers-viewpoint (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.5, 9.5, 9.0, 9.5, 9.0, 9.5 FROM titles t WHERE t.slug = 'omniscient-readers-viewpoint'
ON CONFLICT (title_id) DO NOTHING;

-- returners-magic-special (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.0, 8.5, 8.5, 8.5, NULL FROM titles t WHERE t.slug = 'returners-magic-special'
ON CONFLICT (title_id) DO NOTHING;

-- max-level-hero-returned (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.5, 7.5, 7.5, 7.5, 8.0, NULL FROM titles t WHERE t.slug = 'max-level-hero-returned'
ON CONFLICT (title_id) DO NOTHING;

-- dungeon-reset (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 7.5, 7.5, 8.0, 8.5, NULL FROM titles t WHERE t.slug = 'dungeon-reset'
ON CONFLICT (title_id) DO NOTHING;

-- tutorial-too-hard (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.0, 8.0, 8.5, 8.5, NULL FROM titles t WHERE t.slug = 'tutorial-too-hard'
ON CONFLICT (title_id) DO NOTHING;

-- skeleton-soldier (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.5, 8.0, 8.5, 8.0, 9.0 FROM titles t WHERE t.slug = 'skeleton-soldier'
ON CONFLICT (title_id) DO NOTHING;

-- novels-extra (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.5, 8.0, 8.5, 8.0, 8.5 FROM titles t WHERE t.slug = 'novels-extra'
ON CONFLICT (title_id) DO NOTHING;

-- s-classes-i-raised (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.5, 8.0, 8.5, 8.0, NULL FROM titles t WHERE t.slug = 's-classes-i-raised'
ON CONFLICT (title_id) DO NOTHING;

-- reincarnation-suicidal-battle-god (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 7.5, 7.5, 7.5, 7.5, 8.0, NULL FROM titles t WHERE t.slug = 'reincarnation-suicidal-battle-god'
ON CONFLICT (title_id) DO NOTHING;

-- lore-olympus (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 8.5, 9.5, 7.5, 7.5, 8.0 FROM titles t WHERE t.slug = 'lore-olympus'
ON CONFLICT (title_id) DO NOTHING;

-- tensei-slime (completed, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 7.5, 8.0, 8.0, 8.0, NULL FROM titles t WHERE t.slug = 'tensei-slime'
ON CONFLICT (title_id) DO NOTHING;

-- konosuba (completed, series completed)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 7.5, 7.5, 7.5, 8.5, 8.0 FROM titles t WHERE t.slug = 'konosuba'
ON CONFLICT (title_id) DO NOTHING;

-- berserk (top-favorite, series hiatus — no ending yet)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.5, 9.5, 10.0, 9.5, 8.5, NULL FROM titles t WHERE t.slug = 'berserk'
ON CONFLICT (title_id) DO NOTHING;

-- vagabond (top-favorite, series hiatus — no ending yet)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.5, 9.5, 10.0, 9.5, 8.5, NULL FROM titles t WHERE t.slug = 'vagabond'
ON CONFLICT (title_id) DO NOTHING;

-- hunter-x-hunter (top-favorite, series hiatus — no ending yet)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.5, 9.0, 8.5, 9.5, 8.0, NULL FROM titles t WHERE t.slug = 'hunter-x-hunter'
ON CONFLICT (title_id) DO NOTHING;

-- fullmetal-alchemist already inserted above

