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
- [ ] Supabase project created
- [ ] Database schema migrated (all tables)
- [ ] Seed data (genres, moods, achievements)
- [x] Image processing script (Sharp)
- [x] Placeholder image generation
- [ ] Vercel deployment configured
- [ ] CI/CD pipeline (GitHub Actions)

**Deliverable:** Empty but fully configured project with design system, deployable to Vercel.

---

## Phase 1: Core Experience (Week 3-5)

### Goal: Landing page + Library browse + Title detail — the core loop

**Landing Page:**
- [ ] Cinematic hero section with atmospheric background
- [ ] Animated title reveal
- [ ] Featured titles showcase
- [ ] Scroll-triggered section reveals
- [ ] Navigation (floating desktop, bottom mobile)
- [ ] Smooth page transitions

**Library Browse:**
- [ ] Asymmetrical masonry grid
- [ ] Title cards with blur-up image loading
- [ ] Category tabs (reading, completed, dropped, etc.)
- [ ] Basic filtering (genre, origin)
- [ ] Sort controls
- [ ] Responsive layout (2-col mobile, masonry desktop)
- [ ] Scroll-triggered card reveals
- [ ] Hover effects (desktop)

**Title Detail:**
- [ ] Immersive title hero (cover as backdrop)
- [ ] Multi-dimensional rating display
- [ ] Basic review section
- [ ] External links
- [ ] Genre/mood tags
- [ ] Related titles (basic)
- [ ] Shared element transition from card

**Data Layer:**
- [ ] Supabase queries for titles, ratings, reviews
- [ ] TanStack Query integration
- [ ] Prefetching on hover
- [ ] Loading states with skeletons

**Deliverable:** Functional reading library with cinematic presentation. Visitors can browse, filter, and view title details.

---

## Phase 2: Discovery & Depth (Week 6-8)

### Goal: Mood discovery, tier lists, and enhanced interactions

**Mood/Genre Discovery:**
- [ ] Mood selector with atmospheric transitions
- [ ] Per-mood visual treatment (color, particles, gradient)
- [ ] Discovery grid with mood-filtered results
- [ ] Mood cards with emoji and description
- [ ] Smooth transitions between moods

**Tier List:**
- [ ] Visual tier display with tier-specific styling
- [ ] Tier labels with glow/gradient effects
- [ ] Titles within tiers (horizontal scroll per tier)
- [ ] Tier descriptions
- [ ] Responsive tier layout (vertical stack on mobile)

**Enhanced Interactions:**
- [ ] Card hover physics (tilt, shadow)
- [ ] Parallax sections
- [ ] Staggered scroll reveals (GSAP batch)
- [ ] Ambient background effects (gradient animation)
- [ ] Custom cursor effects (desktop)
- [ ] Improved page transitions

**Review System Enhancement:**
- [ ] Markdown rendering
- [ ] Spoiler toggle sections
- [ ] "Vibe check" display
- [ ] Quotable lines showcase
- [ ] Editorial typography treatment

**Deliverable:** Full discovery experience with mood-based browsing and tier lists. Site feels cinematic and interactive.

---

## Phase 3: Statistics & Achievements (Week 9-11)

### Goal: Data visualization, gamification, and polish

**Statistics Dashboard:**
- [ ] Total reading stats (chapters, hours, titles)
- [ ] Genre distribution chart (animated)
- [ ] Reading timeline (monthly/yearly)
- [ ] Yearly reading arc visualization
- [ ] Reading streak display
- [ ] Animated number counters
- [ ] Responsive chart layouts

**Achievement System:**
- [ ] Badge grid display
- [ ] Individual badge cards (locked/unlocked states)
- [ ] Progress indicators (ring/bar)
- [ ] Achievement unlock animation
- [ ] Rarity-based visual treatment
- [ ] Achievement detail modal

**Performance Polish:**
- [ ] Image optimization audit
- [ ] Bundle size optimization
- [ ] Virtualization for long lists
- [ ] Performance tier detection
- [ ] Reduced motion full implementation
- [ ] Lighthouse audit and fixes

**Visual Polish:**
- [ ] Consistent animation timing
- [ ] Loading state refinement
- [ ] Error state design
- [ ] Empty state design
- [ ] Micro-interaction refinement
- [ ] Mobile gesture polish

**Deliverable:** Complete feature set with statistics, achievements, and production-level polish.

---

## Phase 4: Admin & Content Management (Week 12-14)

### Goal: Owner can manage content without touching code

**Admin Interface:**
- [ ] Authentication (Supabase Auth)
- [ ] Title CRUD (add, edit, delete)
- [ ] Rating editor
- [ ] Review editor (markdown)
- [ ] Image upload with auto-processing
- [ ] Genre/mood assignment
- [ ] External link management
- [ ] Tier assignment (drag-and-drop)
- [ ] Reading progress update
- [ ] Bulk operations

**Content Pipeline:**
- [ ] Image upload → Sharp processing → CDN
- [ ] Automatic blur placeholder generation
- [ ] Dominant color extraction
- [ ] Responsive variant generation

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
- [ ] RSS feed for new additions
- [ ] Newsletter integration
- [ ] Social sharing cards (dynamic OG images)
- [ ] PWA with offline support
- [ ] Search with fuzzy matching
- [ ] Keyboard shortcuts
- [ ] Custom 404 page (cinematic)
- [ ] Easter eggs and hidden interactions

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
