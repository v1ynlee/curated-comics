# Roadmap — Comic Curated

## Implementation Phases

The project is divided into phases that build upon each other. Each phase delivers a usable, deployable state.

---

## Phase 0: Foundation (Week 1-2)

### Goal: Project scaffolding, tooling, and design system foundation

**Setup:**
- [x] Initialize Next.js 14+ with App Router
- [x] Configure TailwindCSS with custom theme
- [x] Set up font loading (DM Sans, Datatype, Playfair Display, JetBrains Mono)
- [x] Configure Lenis smooth scrolling
- [x] Set up Framer Motion with page transitions
- [x] Configure GSAP + ScrollTrigger
- [x] Set up Zustand stores (UI, Library)
- [x] Configure TanStack Query
- [x] Set up Supabase client
- [x] Configure ESLint, Prettier, TypeScript strict mode

**Design System:**
- [x] CSS variables (colors, spacing, typography)
- [x] Tailwind custom utilities
- [x] Base component primitives (Button, Tag, Skeleton, Image)
- [x] Animation variants library
- [x] Easing curves defined
- [x] Responsive breakpoint utilities

**Infrastructure:**
- [x] Supabase project created
- [x] Database schema migrated (all tables)
- [x] Seed data (genres, moods, achievements)
- [x] Image processing script (Sharp)
- [x] Placeholder image generation
- [ ] Vercel deployment configured
- [x] CI/CD pipeline (GitHub Actions)

**Deliverable:** Empty but fully configured project with design system, deployable to Vercel.

---

## Phase 1: Core Experience (Week 3-5)

### Goal: Landing page + Library browse + Title detail — the core loop

**Landing Page:**
- [x] Cinematic hero section with atmospheric background
- [x] Animated title reveal
- [x] Featured titles showcase
- [x] Scroll-triggered section reveals
- [x] Navigation (floating desktop, bottom mobile)
- [x] Smooth page transitions

**Library Browse:**
- [x] Asymmetrical masonry grid
- [x] Title cards with blur-up image loading
- [x] Category tabs (reading, completed, dropped, etc.)
- [x] Basic filtering (genre, origin)
- [x] Sort controls
- [x] Responsive layout (2-col mobile, masonry desktop)
- [x] Scroll-triggered card reveals
- [x] Hover effects (desktop)

**Title Detail:**
- [x] Immersive title hero (cover as backdrop)
- [x] Multi-dimensional rating display
- [x] Basic review section
- [x] External links
- [x] Genre/mood tags
- [x] Related titles (basic)
- [x] Shared element transition from card

**Data Layer:**
- [x] Supabase queries for titles, ratings, reviews
- [x] TanStack Query integration
- [x] Prefetching on hover
- [x] Loading states with skeletons

**Deliverable:** Functional reading library with cinematic presentation. Visitors can browse, filter, and view title details.

---

## Phase 2: Discovery & Depth (Week 6-8)

### Goal: Mood discovery, tier lists, and enhanced interactions

**Mood/Genre Discovery:**
- [x] Mood selector with atmospheric transitions
- [x] Per-mood visual treatment (color, particles, gradient)
- [x] Discovery grid with mood-filtered results
- [x] Mood cards with emoji and description
- [x] Smooth transitions between moods

**Tier List:**
- [x] Visual tier display with tier-specific styling
- [x] Tier labels with glow/gradient effects
- [x] Titles within tiers (horizontal scroll per tier)
- [x] Tier descriptions
- [x] Responsive tier layout (vertical stack on mobile)

**Enhanced Interactions:**
- [x] Card hover physics (tilt, shadow)
- [x] Parallax sections
- [x] Staggered scroll reveals (GSAP batch)
- [x] Ambient background effects (gradient animation)
- [x] Custom cursor effects (desktop)
- [x] Improved page transitions

**Review System Enhancement:**
- [x] Markdown rendering
- [x] Spoiler toggle sections
- [x] "Vibe check" display
- [x] Quotable lines showcase
- [x] Editorial typography treatment

**Deliverable:** Full discovery experience with mood-based browsing and tier lists. Site feels cinematic and interactive.

---

## Phase 3: Statistics & Achievements (Week 9-11)

### Goal: Data visualization, gamification, and polish

**Statistics Dashboard:**
- [x] Total reading stats (chapters, hours, titles)
- [x] Genre distribution chart (animated)
- [x] Reading timeline (monthly/yearly)
- [x] Yearly reading arc visualization
- [x] Reading streak display
- [x] Animated number counters
- [x] Responsive chart layouts

**Achievement System:**
- [x] Badge grid display
- [x] Individual badge cards (locked/unlocked states)
- [x] Progress indicators (ring/bar)
- [x] Achievement unlock animation
- [x] Rarity-based visual treatment
- [x] Achievement detail modal

**Performance Polish:**
- [x] Image optimization audit
- [x] Bundle size optimization
- [x] Virtualization for long lists
- [x] Performance tier detection
- [x] Reduced motion full implementation
- [x] Lighthouse audit and fixes

**Visual Polish:**
- [x] Consistent animation timing
- [x] Loading state refinement
- [x] Error state design
- [x] Empty state design
- [x] Micro-interaction refinement
- [x] Mobile gesture polish

**Deliverable:** Complete feature set with statistics, achievements, and production-level polish.

---

## Phase 4: Admin & Content Management (Week 12-14)

### Goal: Owner can manage content without touching code

**Admin Interface:**
- [x] Authentication (Supabase Auth)
- [x] Title CRUD (add, edit, delete)
- [x] Rating editor
- [x] Review editor (markdown)
- [x] Image upload with auto-processing
- [x] Genre/mood assignment
- [x] External link management
- [x] Tier assignment (drag-and-drop)
- [x] Reading progress update
- [x] Bulk operations

**Content Pipeline:**
- [x] Image upload → Sharp processing → CDN
- [x] Automatic blur placeholder generation
- [x] Dominant color extraction
- [x] Responsive variant generation

**Deliverable:** Self-service content management. Owner can add/edit titles, write reviews, and manage the library.

---

## Phase 5: Premium Features (Week 15+)

### Goal: Stretch features that elevate the experience further

**Optional Enhancements:**
- [ ] WebGL background effects (React Three Fiber)
- [ ] Custom shader backgrounds
- [ ] Audio micro-interactions (subtle, optional)
- [ ] Seasonal theme variants
- [ ] Reading progress sync (if applicable)
- [x] RSS feed for new additions
- [ ] Newsletter integration
- [x] Social sharing cards (dynamic OG images)
- [x] PWA with offline support
- [x] Search with fuzzy matching
- [x] Keyboard shortcuts
- [x] Custom 404 page (cinematic)
- [x] Easter eggs and hidden interactions

---

## Timeline Summary

```
Week 1-2:   Foundation (setup, design system, infrastructure)
Week 3-5:   Core Experience (landing, library, detail)
Week 6-8:   Discovery & Depth (moods, tiers, interactions)
Week 9-11:  Statistics & Achievements (data viz, gamification)
Week 12-14: Admin & Content (CMS, image pipeline)
Week 15+:   Premium Features (WebGL, audio, PWA)
```

---

## Definition of Done (per Phase)

Each phase is complete when:
1. ✅ All listed features are functional
2. ✅ Responsive on mobile, tablet, desktop
3. ✅ Lighthouse Performance > 85
4. ✅ Lighthouse Accessibility > 90
5. ✅ No console errors in production
6. ✅ Reduced motion preference respected
7. ✅ Loading states for all async content
8. ✅ Deployed to Vercel and accessible

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Image performance issues | High | Aggressive optimization, lazy loading, virtualization |
| Animation jank on mobile | High | Performance tier detection, progressive enhancement |
| Scope creep | Medium | Strict phase boundaries, MVP mindset |
| Supabase limitations | Low | Schema designed for flexibility, can migrate |
| Font loading delays | Medium | Preload critical fonts, font-display: swap |
| Bundle size bloat | Medium | Code splitting, tree shaking, bundle analysis |
