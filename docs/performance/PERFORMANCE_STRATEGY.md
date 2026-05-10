# Performance Strategy — Comic Curated

## Performance Philosophy

This is an image-heavy, animation-rich website. Performance is not optional — it's the difference between "cinematic" and "laggy mess." The site must feel smooth on a 3-year-old phone over 4G.

**Core Belief:** A fast site with 90% of the visual vision beats a slow site with 100%.

---

## Performance Budgets

### Core Web Vitals Targets
| Metric | Target | Maximum |
|--------|--------|---------|
| Largest Contentful Paint (LCP) | < 2.5s | < 3.0s |
| First Input Delay (FID) | < 50ms | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.05 | < 0.1 |
| First Contentful Paint (FCP) | < 1.2s | < 1.8s |
| Time to Interactive (TTI) | < 3.0s | < 4.0s |
| Total Blocking Time (TBT) | < 150ms | < 300ms |

### Bundle Size Budgets
| Asset | Budget (gzipped) |
|-------|-------------------|
| Initial JS bundle | < 120KB |
| Initial CSS | < 30KB |
| Per-route JS chunk | < 50KB |
| Total first-load transfer | < 300KB (excluding images) |
| Font files (critical) | < 100KB |
| Font files (total) | < 300KB |

### Image Budgets
| Image Type | Max Size | Format |
|------------|----------|--------|
| Cover thumbnail (card) | 30KB | WebP/AVIF |
| Cover medium (detail) | 80KB | WebP/AVIF |
| Cover full (hero) | 150KB | WebP/AVIF |
| Banner/background | 200KB | WebP/AVIF |
| Blur placeholder | 1-2KB | Base64 inline |
| Badge/icon | 5KB | SVG/WebP |

### Animation Performance
| Metric | Target |
|--------|--------|
| Frame rate | 60fps constant |
| Frame budget | < 16.67ms per frame |
| Max simultaneous animations | 3 complex + unlimited CSS |
| Scroll jank frames | 0 |
| Input latency during animation | < 50ms |

---

## Loading Strategy

### Critical Rendering Path
```
1. HTML shell (< 14KB for first TCP roundtrip)
2. Critical CSS (inlined in <head>)
3. Preloaded fonts (DM Sans Regular, Datatype Bold)
4. Hero section renders (FCP)
5. Above-fold images load (LCP)
6. JavaScript hydrates
7. Below-fold content lazy loads
8. Non-critical fonts load
9. Ambient animations begin
```

### Resource Priority
```
Priority 1 (Preload):
  - Critical CSS
  - Hero background image
  - Primary fonts (2 files)
  - Initial route JS

Priority 2 (High):
  - Above-fold cover images
  - Route-specific JS chunks
  - Secondary fonts

Priority 3 (Low/Lazy):
  - Below-fold images
  - Animation libraries (GSAP)
  - Non-critical fonts
  - Analytics

Priority 4 (Idle):
  - Prefetch next likely routes
  - Service worker registration
  - Non-visible image preloading
```

### Next.js Optimization Features
```javascript
// next.config.js optimizations
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'gsap'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

---

## Image Optimization Strategy

### Format Priority
```
1. AVIF (best compression, growing support)
2. WebP (wide support, good compression)
3. JPEG (fallback for ancient browsers)
```

### Responsive Image Sizes
```html
<!-- Cover art in card grid -->
<img
  srcset="
    /covers/title-320w.avif 320w,
    /covers/title-480w.avif 480w,
    /covers/title-640w.avif 640w
  "
  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
/>

<!-- Hero/banner images -->
<img
  srcset="
    /banners/hero-768w.avif 768w,
    /banners/hero-1200w.avif 1200w,
    /banners/hero-1920w.avif 1920w
  "
  sizes="100vw"
/>
```

### Lazy Loading Implementation
```javascript
// Intersection Observer with generous rootMargin
const imageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        imageObserver.unobserve(entry.target);
      }
    });
  },
  { rootMargin: '200px 0px' } // Start loading 200px before visible
);
```

### Blur Placeholder Strategy (LQIP)
```
1. Generate 20px-wide version of each cover
2. Encode as base64 (typically 200-500 bytes)
3. Inline in HTML/JSON data
4. Display with CSS blur(20px) and scale(1.1)
5. Crossfade to full image on load
```

### Image Processing Pipeline
```
Source image (any format, any size)
  ↓
Sharp processing:
  ├── Thumbnail: 320px wide, quality 75, WebP + AVIF
  ├── Medium: 640px wide, quality 80, WebP + AVIF
  ├── Large: 1200px wide, quality 80, WebP + AVIF
  ├── Blur: 20px wide, quality 30, base64 JPEG
  └── Metadata: dominant color, aspect ratio
  ↓
Output to /public/images/ with naming convention:
  {slug}-{size}w.{format}
  {slug}-blur.txt (base64 string)
  {slug}-meta.json (color, ratio)
```

---

## JavaScript Performance

### Code Splitting Strategy
```
Route-based splitting (automatic with Next.js):
  /           → home.chunk.js
  /library    → library.chunk.js
  /title/[id] → title-detail.chunk.js
  /discover   → discover.chunk.js
  /tiers      → tiers.chunk.js
  /stats      → stats.chunk.js

Feature-based splitting (dynamic imports):
  - GSAP + ScrollTrigger → loaded on first scroll
  - Framer Motion → loaded with first animated component
  - Chart library → loaded only on /stats route
  - Drag library → loaded only on /tiers (admin mode)
```

### Dynamic Import Patterns
```javascript
// Heavy libraries loaded on demand
const GSAPModule = dynamic(() => import('@/lib/gsap-setup'), { ssr: false });
const ChartComponent = dynamic(() => import('@/components/Chart'), { 
  ssr: false,
  loading: () => <ChartSkeleton />
});
```

### React Performance Patterns
```javascript
// Memoize expensive computations
const filteredTitles = useMemo(() => 
  titles.filter(t => t.genre === selectedGenre),
  [titles, selectedGenre]
);

// Virtualize long lists
import { useVirtualizer } from '@tanstack/react-virtual';

// Debounce search/filter inputs
const debouncedSearch = useDebouncedCallback(
  (value) => setSearchQuery(value),
  300
);
```

### Bundle Analysis Targets
```
react + react-dom:     ~45KB gzipped (unavoidable)
next.js runtime:       ~30KB gzipped
framer-motion:         ~25KB gzipped (tree-shaken)
gsap + scrolltrigger:  ~25KB gzipped
zustand:               ~2KB gzipped
tanstack-query:        ~12KB gzipped
tailwindcss:           ~10KB gzipped (purged)
lenis:                 ~5KB gzipped
─────────────────────────────────────
Estimated total:       ~154KB gzipped initial
```

---

## CSS Performance

### Critical CSS Strategy
- Inline above-fold CSS in `<head>` (< 14KB)
- Load remaining CSS asynchronously
- TailwindCSS purges unused classes in production
- No unused CSS in production build

### Animation-Safe Properties
```css
/* ONLY animate these for 60fps guarantee */
.performant-animation {
  transform: translateX() translateY() scale() rotate();
  opacity: 0-1;
  filter: blur() brightness();
  clip-path: polygon() circle() inset();
}

/* NEVER animate these */
.layout-thrash {
  /* width, height, top, left, margin, padding, border */
  /* These trigger layout recalculation */
}
```

### Containment Strategy
```css
/* Isolate sections for rendering performance */
.section {
  contain: layout style paint;
}

/* Cards that animate independently */
.card {
  contain: layout style;
  will-change: transform; /* Only when about to animate */
}

/* Heavy content below fold */
.below-fold-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* Estimated height */
}
```

---

## Scroll Performance

### Lenis Configuration for Performance
```javascript
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
  // Performance: limit RAF to 60fps
});

// Sync with GSAP ticker (single RAF loop)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
```

### Scroll Event Optimization
```javascript
// NEVER do heavy work in scroll handlers
// Use ScrollTrigger for scroll-linked animations
// Use IntersectionObserver for visibility detection
// Use passive event listeners

element.addEventListener('scroll', handler, { passive: true });
```

---

## Caching Strategy

### Browser Caching
```
Static assets (fonts, images):  Cache-Control: public, max-age=31536000, immutable
HTML pages:                     Cache-Control: public, max-age=0, must-revalidate
API responses:                  Cache-Control: private, max-age=60, stale-while-revalidate=300
```

### TanStack Query Caching
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,         // 30 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});
```

### Service Worker (PWA)
```
Cache-first strategy for:
  - Font files
  - Static images
  - CSS/JS bundles

Network-first strategy for:
  - API data
  - Dynamic content
  - User-specific data

Stale-while-revalidate for:
  - Title metadata
  - Cover images (may update)
```

---

## Monitoring & Alerting

### Performance Metrics to Track
- Core Web Vitals (real user monitoring)
- JavaScript bundle size per deploy
- Image sizes per deploy
- Time to first meaningful paint
- Scroll frame rate (p50, p95)
- Animation frame drops

### Performance Testing Checklist
- [ ] Lighthouse score > 90 (Performance)
- [ ] No layout shifts during image loading
- [ ] 60fps scroll on throttled CPU (4x)
- [ ] First load < 3s on 4G throttled
- [ ] No JS errors in production
- [ ] All images serve WebP/AVIF
- [ ] No render-blocking resources
- [ ] Font loading doesn't cause FOUT/FOIT flash

---

## Device-Specific Optimizations

### Low-End Mobile (< 4GB RAM)
- Disable particle effects entirely
- Reduce parallax to simple opacity
- Limit visible animated elements to 2
- Use simpler easing (no spring physics)
- Reduce image quality by 10%

### Mid-Range Mobile (4-6GB RAM)
- Reduce particle count by 50%
- Simplify parallax (2 layers max)
- Standard animation complexity
- Full image quality

### Desktop
- Full particle effects
- Full parallax (5 layers)
- All animation tiers active
- Highest image quality
- Cursor effects enabled

### Detection Strategy
```javascript
// Use navigator.deviceMemory and connection API
const getPerformanceTier = () => {
  const memory = navigator.deviceMemory || 4;
  const connection = navigator.connection?.effectiveType || '4g';
  
  if (memory <= 2 || connection === '2g' || connection === 'slow-2g') return 'low';
  if (memory <= 4 || connection === '3g') return 'mid';
  return 'high';
};
```
