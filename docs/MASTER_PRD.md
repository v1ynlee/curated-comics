# MASTER PRD — Comic Curated

## Project Codename: **Comic Curated**
## Version: 1.0.0
## Status: Planning Phase
## Last Updated: 2026-05-10

---

## 1. Executive Summary

Comic Curated is a highly immersive, cinematic personal comic-reading showcase website. It functions as a personal reading archive, curated recommendation platform, interactive showcase, visual identity piece, and artistic frontend portfolio — all wrapped in a premium anime-inspired experience.

The site is NOT a dashboard. NOT a CRUD panel. NOT a generic gallery. It is an **interactive anime museum** — a living, breathing digital space that communicates deep passion for Korean manhwa, Chinese manhua, and Japanese manga through every pixel, animation, and interaction.

---

## 2. Vision Statement

> "A website that makes visitors feel like they've stepped into a cinematic anime world — where every scroll tells a story, every interaction has weight, and the owner's love for comics is palpable in every detail."

**Target Visitor Reactions:**
- "WTF this site has soul."
- "This person REALLY loves comics."
- "How is this so smooth despite so many images and animations?"
- "This feels like a premium anime experience."

---

## 3. Project Goals

| Priority | Goal | Success Metric |
|----------|------|----------------|
| P0 | Cinematic visual experience | Visitor emotional engagement |
| P0 | Smooth performance despite heavy imagery | 60fps scrolling, <3s LCP |
| P0 | Personal reading archive | Complete library management |
| P1 | Curated recommendation platform | Genre/mood discovery system |
| P1 | Interactive showcase | Meaningful micro-interactions |
| P1 | Visual identity / personal branding | Cohesive design language |
| P2 | Artistic frontend portfolio | Technical impressiveness |
| P2 | Statistics & achievements | Gamification engagement |

---

## 4. Target Audience

**Primary:** The site owner — as a personal tool and showcase.
**Secondary:** Fellow comic readers discovering recommendations.
**Tertiary:** Frontend developers / designers impressed by the craft.

---

## 5. Core Feature Domains

### 5.1 Reading Library
A comprehensive personal reading archive with emotional categorization:

| Category | Purpose |
|----------|---------|
| Currently Reading | Active titles with progress tracking |
| Completed | Finished titles with completion date |
| Dropped | Abandoned titles with reason |
| Paused | On-hold titles |
| Wishlist | Titles queued for future reading |
| Hidden Gems | Underrated discoveries |
| Guilty Pleasure | "Trash but I love it" category |
| Top Favorites | All-time best |
| Most Re-read | Comfort titles |

### 5.2 Multi-Dimensional Rating System

Each title receives granular ratings:
- **Personal Rating** — overall subjective score
- **Emotional Rating** — how deeply it affected you
- **Art Rating** — visual quality assessment
- **Story Rating** — narrative quality
- **Pacing Rating** — flow and rhythm
- **Ending Rating** — satisfaction with conclusion

Rating scale: 1-10 with half-point precision, displayed as custom visual indicators (not generic stars).

### 5.3 Review System
- Highly subjective personal reviews
- Casual, authentic writing style
- Emotional reactions and memorable commentary
- Spoiler-tagged sections
- "Vibe check" quick summaries
- Quotable one-liners per title

### 5.4 Genre/Mood Discovery
Non-traditional categorization system:
- Depression Arc
- Aura Farming
- Brainrot
- Manipulator MC
- Comfy Slice of Life
- Revenge Fantasy
- Murim Addiction
- Power Fantasy
- Emotional Damage
- Villainess Era
- Necromancer Vibes
- Regression Loop

### 5.5 Statistics Dashboard
- Total chapters consumed
- Estimated reading hours
- Genre distribution (visual charts)
- Reading history timeline
- Yearly reading arc
- Most consumed themes
- Reading streaks
- Monthly consumption graphs

### 5.6 External Reading Links
Each title links to official sources:
- Webtoon
- KakaoPage
- Naver
- Tapas
- MangaDex
- Official publisher sites

### 5.7 Tier Lists
Custom tier system:
- SSS+ (Transcendent)
- S (Peak Fiction)
- A (Excellent)
- B (Good)
- C (Generic But Addictive)
- D (Mid)
- F (Trash But I Love It)

Interactive, draggable tier list with visual flair.

### 5.8 Achievement / Badge System
Unlockable badges based on reading patterns:
- Murim Survivor (50+ murim titles)
- Villainess Addict (30+ villainess titles)
- Necromancer Consumer (all necromancer titles read)
- Regression Veteran (20+ regression titles)
- Art Connoisseur (10+ titles rated 10 for art)
- Speed Reader (1000+ chapters in a month)
- Completionist (100+ completed titles)
- Genre Hopper (titles in 15+ genres)

---

## 6. Technology Stack

### Frontend (Primary)
| Technology | Purpose |
|------------|---------|
| React 18+ | UI framework |
| Next.js 14+ | Framework, SSR, routing |
| TailwindCSS 3+ | Utility-first styling |
| Framer Motion | Page transitions, layout animations |
| GSAP | Complex timeline animations, scroll triggers |
| Lenis | Smooth scrolling |
| Zustand | Client state management |
| TanStack Query | Server state, caching |

### Frontend (Enhancement)
| Technology | Purpose |
|------------|---------|
| React Three Fiber | Optional 3D elements |
| WebGL / Shaders | Background effects, particles |
| Sharp | Image processing pipeline |

### Backend
| Technology | Purpose |
|------------|---------|
| Supabase | Database, auth, storage |
| Supabase Edge Functions | Serverless logic |
| Supabase Storage | Image CDN |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Vercel | Hosting, edge deployment |
| Cloudflare | CDN, image optimization |
| GitHub Actions | CI/CD |

---

## 7. Non-Functional Requirements

### Performance
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 3.0s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- 60fps animations on mid-range devices
- Smooth scrolling with 200+ images loaded

### Accessibility
- WCAG 2.1 AA compliance where possible
- Reduced motion support
- Keyboard navigation
- Screen reader compatible structure
- High contrast mode available

### Browser Support
- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+
- Mobile Safari / Chrome (iOS/Android)

### Responsive Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px - 1440px
- Ultrawide: 1440px+

---

## 8. Content Volume Estimates

| Content Type | Estimated Volume |
|--------------|-----------------|
| Total titles | 300-500+ |
| Cover images | 300-500+ |
| Banner images | 50-100 |
| Reviews | 100-200 |
| Badges | 30-50 |
| Genre tags | 50-100 |
| Mood tags | 30-50 |

---

## 9. Document Index

| Document | Path | Purpose |
|----------|------|---------|
| Master PRD | `docs/MASTER_PRD.md` | This document |
| UI/UX Direction | `docs/design/UI_UX_DIRECTION.md` | Visual and interaction philosophy |
| Design Principles | `docs/design/DESIGN_PRINCIPLES.md` | Core design rules |
| Typography System | `docs/design/TYPOGRAPHY_SYSTEM.md` | Font strategy and hierarchy |
| Motion System | `docs/motion/MOTION_SYSTEM.md` | Animation philosophy and specs |
| Animation Guidelines | `docs/motion/ANIMATION_GUIDELINES.md` | Implementation rules |
| Performance Strategy | `docs/performance/PERFORMANCE_STRATEGY.md` | Optimization planning |
| Image Pipeline | `docs/performance/IMAGE_PIPELINE.md` | Image processing strategy |
| Component Architecture | `docs/architecture/COMPONENT_ARCHITECTURE.md` | Component structure |
| Content Structure | `docs/architecture/CONTENT_STRUCTURE.md` | Data and content modeling |
| Database Schema | `docs/database/DATABASE_SCHEMA_PLANNING.md` | Database design |
| Mobile Experience | `docs/design/MOBILE_EXPERIENCE.md` | Mobile-specific planning |
| Branding Direction | `docs/branding/BRANDING_DIRECTION.md` | Visual identity |
| Accessibility Notes | `docs/accessibility/ACCESSIBILITY_NOTES.md` | A11y planning |
| Future Features | `docs/roadmap/FUTURE_FEATURES.md` | Roadmap and extensions |
| Roadmap | `docs/roadmap/ROADMAP.md` | Implementation phases |

---

## 10. Success Criteria

The project is successful when:
1. A visitor spends 3+ minutes exploring without being prompted
2. The site loads smoothly on mobile with no perceptible jank
3. The reading library is fully functional and enjoyable to browse
4. The emotional/cinematic quality is immediately apparent
5. Fellow developers ask "how did you build this?"
6. The owner genuinely enjoys using it as their reading tracker
