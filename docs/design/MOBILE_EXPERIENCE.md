# Mobile Experience — Comic Curated

## Philosophy

Mobile is not a degraded desktop. It's a **focused cinematic experience** optimized for touch, vertical scrolling, and intimate viewing. The emotional impact should be equal to desktop — achieved through different means.

On mobile, the site should feel like scrolling through a premium webtoon reader — vertical, immersive, and smooth.

---

## Mobile-Specific Design Principles

### 1. Vertical Cinema
- Embrace the vertical format (webtoon-style)
- Full-width compositions that fill the viewport
- Vertical scroll as the primary interaction
- Each "screen" is a complete visual moment

### 2. Thumb-Zone Awareness
- Primary actions within thumb reach (bottom 40% of screen)
- Navigation at bottom, not top
- Swipe gestures for common actions
- No small tap targets (minimum 44x44px)

### 3. Performance First
- Reduce particle effects to minimum
- Disable parallax on low-end devices
- Aggressive image optimization
- Skeleton screens for loading states

### 4. Touch as Expression
- Swipe between titles (carousel)
- Long-press for quick preview
- Pull-to-refresh with custom animation
- Pinch-to-zoom on cover art

---

## Mobile Navigation

### Bottom Navigation Bar
```
┌─────────────────────────────────────┐
│                                     │
│         [Page Content]              │
│                                     │
├─────────────────────────────────────┤
│  🏠    📚    🔮    🏆    📊       │
│ Home  Library Discover Tiers Stats  │
└─────────────────────────────────────┘
```

- Fixed bottom bar with 5 primary destinations
- Active state with subtle glow/color shift
- Haptic feedback on tap (where supported)
- Hides on scroll-down, reveals on scroll-up

### Secondary Navigation
- Category switching via horizontal scroll tabs
- Filter access via bottom sheet (slides up)
- Search via expandable search bar at top
- Back navigation via swipe-from-edge gesture

---

## Mobile Layout Adaptations

### Hero Section
**Desktop:** Full-viewport cinematic with particles and parallax
**Mobile:** Full-viewport with simplified background, stronger gradient overlay, larger text

### Library Grid
**Desktop:** Asymmetrical masonry with varying sizes
**Mobile:** 2-column grid with featured items spanning full width

```
┌─────────────────────┐
│   [Featured Title]   │  ← Full width, cinematic
│   Full Width Card    │
├──────────┬──────────┤
│  Title   │  Title   │  ← Standard 2-col
│   Card   │   Card   │
├──────────┼──────────┤
│  Title   │  Title   │
│   Card   │   Card   │
├──────────┴──────────┤
│   [Featured Title]   │  ← Full width break
└─────────────────────┘
```

### Title Detail
**Desktop:** Side-by-side layout with atmospheric background
**Mobile:** Vertical stack with cover art as hero backdrop

```
┌─────────────────────┐
│                     │
│   [Cover Art as     │
│    Background]      │
│                     │
│   ─── Title ───     │
│   ─── Rating ──     │
│                     │
├─────────────────────┤
│   Review Text       │
│   ...               │
├─────────────────────┤
│   Related Titles    │
│   [horizontal       │
│    scroll]          │
└─────────────────────┘
```

### Statistics
**Desktop:** Multi-column data visualization
**Mobile:** Vertical card stack with one stat per card, swipeable

### Tier List
**Desktop:** Full horizontal tier display
**Mobile:** Vertical tier stack, each tier is a horizontal scroll

---

## Mobile Gestures

| Gesture | Action |
|---------|--------|
| Swipe left/right | Navigate between titles in a list |
| Swipe up | Scroll / dismiss bottom sheet |
| Swipe down | Pull to refresh / close detail view |
| Long press | Quick preview popup |
| Pinch | Zoom cover art |
| Double tap | Quick-add to favorites |
| Edge swipe (left) | Back navigation |

---

## Mobile Performance Budget

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.2s |
| Largest Contentful Paint | < 2.5s |
| Total Blocking Time | < 200ms |
| Cumulative Layout Shift | < 0.05 |
| JavaScript bundle (initial) | < 150KB gzipped |
| Images per viewport | Max 4-6 visible |

### Performance Optimizations for Mobile
- Disable GSAP ScrollTrigger complex animations
- Replace parallax with simple opacity transitions
- Reduce particle count by 80%
- Use CSS animations over JS where possible
- Intersection Observer for lazy loading (threshold: 200px)
- Skeleton screens instead of spinners
- Preload next likely navigation target

---

## Mobile Animation Adjustments

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Mobile-Specific Motion
| Desktop Effect | Mobile Equivalent |
|----------------|-------------------|
| Parallax scroll | Subtle opacity fade |
| Hover tilt | Tap scale feedback |
| Particle background | Gradient animation |
| Cursor effects | N/A (removed) |
| Complex page transitions | Simple slide/fade |
| Scroll-triggered staggers | Simpler fade-in |

---

## Mobile Touch Feedback

### Tap States
- Active state: scale(0.97) + slight opacity reduction
- Release: spring back to scale(1)
- Duration: 100ms active, 200ms release

### Scroll Feedback
- Overscroll: custom elastic effect (not browser default)
- Momentum: preserved via Lenis mobile config
- Snap points: optional, only for key sections

---

## Mobile-Specific Components

### Bottom Sheet
Used for: filters, sorting, quick actions
- Drag handle at top
- Snap points: 30%, 60%, 90% of viewport
- Backdrop blur behind sheet
- Smooth spring animation

### Horizontal Scroll Cards
Used for: related titles, category browsing
- Snap to card edges
- Peek next card (shows 20% of next item)
- Scroll indicators (dots or progress bar)
- Momentum scrolling

### Expandable Cards
Used for: reviews, descriptions
- Collapsed: 3 lines with "Read more"
- Expanded: full content with smooth height animation
- No layout shift on expand

### Pull-to-Refresh
- Custom animation (not browser default)
- Themed to match site aesthetic
- Subtle haptic on trigger point

---

## Mobile Typography Adjustments

```
Body text:        16px minimum (never smaller)
Card titles:      18px
Section titles:   24-32px (fluid)
Hero text:        36-48px (fluid)
Captions:         14px minimum
Touch targets:    16px minimum label size
```

### Reading Comfort
- Line length: max 45 characters on mobile
- Line height: 1.7 for body text
- Paragraph spacing: 1.5em
- No justified text on mobile

---

## Offline Considerations

### Service Worker Strategy
- Cache critical CSS and JS
- Cache viewed title data
- Cache cover images for viewed titles
- Show cached content when offline
- Sync reading progress when back online

### Offline UI
- Subtle indicator when offline (not intrusive)
- Cached content clearly available
- Graceful degradation for uncached content
- Queue actions for sync (rating changes, etc.)

---

## Mobile Testing Checklist

- [ ] All tap targets ≥ 44x44px
- [ ] No horizontal scroll on any page
- [ ] Text readable without zooming
- [ ] Forms usable with on-screen keyboard
- [ ] Bottom nav doesn't overlap content
- [ ] Images load progressively (blur → sharp)
- [ ] Animations smooth at 60fps on mid-range device
- [ ] No layout shift during image loading
- [ ] Gestures don't conflict with browser gestures
- [ ] Dark mode respects system preference
- [ ] Landscape orientation handled gracefully
