# Accessibility Notes — Comic Curated

## Accessibility Philosophy

Accessibility is not at odds with cinematic design. A visually stunning site can also be navigable, readable, and usable by everyone. The goal is WCAG 2.1 AA compliance where possible, with thoughtful accommodations for the site's heavy visual nature.

**Note:** Full WCAG validation requires manual testing with assistive technologies and expert accessibility review. This document outlines the planned approach.

---

## Core Accessibility Requirements

### 1. Perceivable

#### Text Contrast
- Body text on dark backgrounds: minimum 4.5:1 contrast ratio
- Large text (24px+ or 18.67px+ bold): minimum 3:1 contrast ratio
- UI components and graphical objects: minimum 3:1 against adjacent colors

```
Verified combinations:
  #f0f0f5 on #08080f → 18.2:1 ✅ (primary text on deep bg)
  #a0a0b8 on #08080f → 7.8:1  ✅ (secondary text on deep bg)
  #6b6b80 on #08080f → 4.1:1  ⚠️ (tertiary — use only for non-essential)
  #f0f0f5 on #1a1a2e → 13.5:1 ✅ (text on surface)
  #8b5cf6 on #08080f → 4.6:1  ✅ (accent on deep bg — large text only)
```

#### Images
- All cover images have meaningful `alt` text (title name + origin)
- Decorative images (particles, gradients) use `alt=""` or `aria-hidden="true"`
- Blur placeholders are not announced to screen readers
- SVG icons have `aria-label` or are hidden if decorative

#### Color Independence
- Information is never conveyed by color alone
- Tier levels have text labels alongside colors
- Rating values are numeric, not just visual bars
- Status indicators have icons + text, not just color dots

#### Text Sizing
- All text resizable up to 200% without loss of content
- No text in images (except decorative/artistic elements)
- Minimum 16px body text
- Minimum 14px for metadata/captions

---

### 2. Operable

#### Keyboard Navigation
- All interactive elements reachable via Tab
- Logical tab order following visual layout
- Visible focus indicators (custom styled, not browser default)
- Skip-to-content link at page top
- Escape closes modals/sheets/overlays

```css
/* Custom focus indicator */
:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

#### Focus Management
- Page transitions move focus to new page heading
- Modal open → focus trapped inside modal
- Modal close → focus returns to trigger element
- Filter changes → focus remains on filter area
- Dynamic content updates announced via aria-live

#### Motion & Animation
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Disable Lenis smooth scroll */
  html {
    scroll-behavior: auto !important;
  }
  
  /* Disable parallax */
  .parallax-layer {
    transform: none !important;
  }
  
  /* Disable particles */
  .particle-field {
    display: none;
  }
}
```

#### Touch Targets
- Minimum 44×44px for all interactive elements
- Adequate spacing between touch targets (minimum 8px gap)
- Larger targets for primary actions (48×48px+)

#### Timing
- No time limits on content reading
- Auto-playing animations can be paused
- No content that flashes more than 3 times per second

---

### 3. Understandable

#### Language
- Page language declared: `<html lang="en">`
- CJK title text marked with appropriate lang attribute:
  ```html
  <span lang="ko">나 혼자만 레벨업</span>
  <span lang="ja">進撃の巨人</span>
  <span lang="zh">斗破苍穹</span>
  ```

#### Predictable Behavior
- Navigation consistent across pages
- Interactive elements behave predictably
- No unexpected context changes on focus
- Form inputs have visible labels

#### Error Prevention
- Confirmation for destructive actions (delete, drop)
- Undo capability for status changes
- Clear error messages with recovery suggestions

---

### 4. Robust

#### Semantic HTML
```html
<!-- Page structure -->
<header role="banner">...</header>
<nav role="navigation" aria-label="Main">...</nav>
<main role="main">...</main>
<footer role="contentinfo">...</footer>

<!-- Content sections -->
<section aria-labelledby="section-heading">
  <h2 id="section-heading">Section Title</h2>
</section>

<!-- Card grid -->
<ul role="list" aria-label="Reading library">
  <li role="listitem">
    <article aria-label="Title Name">...</article>
  </li>
</ul>

<!-- Rating display -->
<div role="meter" aria-label="Overall rating" 
     aria-valuenow="8.5" aria-valuemin="1" aria-valuemax="10">
  8.5 / 10
</div>
```

#### ARIA Patterns
```html
<!-- Tab navigation (categories) -->
<div role="tablist" aria-label="Library categories">
  <button role="tab" aria-selected="true" aria-controls="panel-reading">
    Reading
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-completed">
    Completed
  </button>
</div>
<div role="tabpanel" id="panel-reading" aria-labelledby="tab-reading">
  ...
</div>

<!-- Modal/Bottom Sheet -->
<div role="dialog" aria-modal="true" aria-labelledby="sheet-title">
  <h2 id="sheet-title">Filters</h2>
  ...
</div>

<!-- Live region for dynamic updates -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  Showing 42 titles in "Currently Reading"
</div>

<!-- Spoiler content -->
<details>
  <summary>Spoiler Warning: Click to reveal</summary>
  <div>Spoiler content here...</div>
</details>
```

---

## Screen Reader Considerations

### Content Order
The DOM order should match the visual reading order:
1. Skip link
2. Navigation
3. Page heading
4. Primary content
5. Secondary content
6. Footer

### Hidden Decorative Elements
```html
<!-- Particles, gradients, ambient effects -->
<div class="particle-field" aria-hidden="true"></div>
<div class="gradient-bg" aria-hidden="true"></div>

<!-- Decorative icons -->
<svg aria-hidden="true" focusable="false">...</svg>

<!-- Meaningful icons -->
<svg role="img" aria-label="External link">...</svg>
```

### Screen Reader Only Text
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

Usage:
```html
<!-- Rating with visual-only bar -->
<div class="rating-bar" aria-hidden="true"></div>
<span class="sr-only">Art rating: 9 out of 10</span>

<!-- Icon-only buttons -->
<button aria-label="Filter titles">
  <FilterIcon aria-hidden="true" />
</button>
```

---

## Reduced Motion Experience

When `prefers-reduced-motion: reduce` is active, the site should still feel intentional:

### What Changes
| Feature | Full Motion | Reduced Motion |
|---------|-------------|----------------|
| Page transitions | Slide + fade | Instant swap |
| Scroll reveals | Fade up + stagger | Instant visible |
| Hover effects | Lift + tilt | Color change only |
| Parallax | Multi-layer depth | Static positioning |
| Particles | Floating animation | Hidden |
| Loading states | Shimmer animation | Static grey |
| Charts | Animated draw | Instant render |
| Carousel | Smooth slide | Instant snap |

### What Stays
- Color transitions (not motion)
- Opacity changes (subtle, not motion)
- Layout changes (instant, no animation)
- Focus indicators
- All content and functionality

---

## High Contrast Mode

```css
@media (forced-colors: active) {
  /* Ensure custom elements are visible */
  .rating-bar {
    border: 1px solid CanvasText;
  }
  
  .badge-icon {
    forced-color-adjust: none; /* Preserve badge colors */
  }
  
  .gradient-text {
    background: none;
    -webkit-text-fill-color: CanvasText;
    color: CanvasText;
  }
}
```

---

## Testing Checklist

### Automated Testing
- [ ] axe-core integration in CI/CD
- [ ] Lighthouse accessibility audit > 90
- [ ] Color contrast checker on all text combinations
- [ ] HTML validation (no duplicate IDs, proper nesting)

### Manual Testing
- [ ] Keyboard-only navigation (full site traversal)
- [ ] Screen reader testing (NVDA on Windows)
- [ ] Zoom to 200% (no content loss)
- [ ] Reduced motion preference respected
- [ ] High contrast mode functional
- [ ] Mobile VoiceOver/TalkBack testing

### Content Testing
- [ ] All images have appropriate alt text
- [ ] All form inputs have labels
- [ ] All interactive elements have accessible names
- [ ] Error messages are descriptive and helpful
- [ ] CJK text properly marked with lang attributes

---

## Accessibility Compromises & Rationale

Some design choices prioritize visual experience with accessibility accommodations:

| Design Choice | A11y Impact | Mitigation |
|---------------|-------------|------------|
| Dark-only theme | Some users prefer light | High contrast mode support |
| Heavy animation | Motion sensitivity | Full reduced-motion support |
| Asymmetric layouts | Reading order confusion | Logical DOM order maintained |
| Custom scrolling (Lenis) | May conflict with AT | Fallback to native scroll |
| Hover-revealed content | Not accessible on touch/keyboard | Content also accessible via click/focus |
| Artistic typography | May be harder to read | Body text uses highly legible font |
| Background effects | Distracting for some | Disabled with reduced-motion |
