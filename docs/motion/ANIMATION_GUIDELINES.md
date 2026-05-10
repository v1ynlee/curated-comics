# Animation Guidelines — Comic Curated

## Implementation Rules

This document provides concrete implementation guidance for developers working with the motion system.

---

## Rule 1: The 60fps Contract

Every animation MUST maintain 60fps on a mid-range device (equivalent to a 2022 mid-range Android phone or iPhone 11).

### Testing Protocol
1. Open Chrome DevTools → Performance tab
2. Enable CPU throttling (4x slowdown)
3. Record while triggering animation
4. If ANY frame exceeds 16.67ms, optimize or simplify

### Common 60fps Killers
- Animating `box-shadow` (use pseudo-element with opacity instead)
- Animating `border-radius` on large elements
- Too many simultaneous GSAP tweens
- Unoptimized SVG path animations
- Large `filter: blur()` on mobile

---

## Rule 2: Stagger, Don't Swarm

When multiple elements animate, they MUST stagger — never all at once.

### Stagger Timing
```javascript
// Good: Staggered reveal
const staggerConfig = {
  each: 0.075,        // 75ms between items
  from: "start",      // Sequential from first
  ease: "power2.out"  // Stagger easing
};

// For grids: use 2D stagger
const gridStagger = {
  each: 0.05,
  grid: "auto",
  from: "center"      // Ripple from center
};
```

### Maximum Stagger Rules
- List items: max 8 items staggering simultaneously
- Grid items: max 12 items in view staggering
- If more items exist, batch them (first 8 stagger, rest fade in together)

---

## Rule 3: Scroll Animation Zones

Scroll-triggered animations have specific trigger zones:

```javascript
// Standard reveal trigger
ScrollTrigger.create({
  trigger: element,
  start: "top 85%",    // Start when top of element hits 85% of viewport
  end: "top 20%",      // End when top hits 20%
  toggleActions: "play none none none", // Play once
});

// Parallax trigger (scrub)
ScrollTrigger.create({
  trigger: section,
  start: "top bottom",  // Start when section enters viewport
  end: "bottom top",    // End when section leaves viewport
  scrub: 1,             // Smooth 1-second lag
});
```

### Trigger Rules
- Elements should be 80-90% visible before animating (no premature reveals)
- Parallax scrub value: 0.5-1.5 (higher = smoother but laggier feel)
- Never use `scrub: true` (instant, no smoothing) — always use a number
- Pin sparingly — maximum 1 pinned section per page

---

## Rule 4: Framer Motion Patterns

### Page Transition Template
```javascript
// Layout: wrap pages in AnimatePresence
<AnimatePresence mode="wait">
  <motion.div
    key={router.pathname}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
  >
    {children}
  </motion.div>
</AnimatePresence>

// Variants
const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 8,
    filter: "blur(4px)" 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    filter: "blur(4px)",
    transition: { duration: 0.3 }
  },
};
```

### Component Reveal Template
```javascript
const revealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.075,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

// Usage
<motion.div
  variants={revealVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  custom={index}
/>
```

### Hover Animation Template
```javascript
<motion.div
  whileHover={{ 
    y: -4, 
    transition: { type: "spring", stiffness: 300, damping: 20 } 
  }}
  whileTap={{ scale: 0.98 }}
>
```

---

## Rule 5: GSAP Usage Patterns

### ScrollTrigger Batch (for lists)
```javascript
// Efficient: batch elements instead of individual triggers
ScrollTrigger.batch(".reveal-item", {
  onEnter: (elements) => {
    gsap.to(elements, {
      opacity: 1,
      y: 0,
      stagger: 0.075,
      duration: 0.6,
      ease: "power2.out",
    });
  },
  start: "top 85%",
  once: true,
});
```

### Timeline for Sequences
```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "bottom top",
    scrub: 1,
  }
});

tl.to(".hero-bg", { scale: 1.1, opacity: 0.5 }, 0)
  .to(".hero-title", { y: -50, opacity: 0 }, 0.2)
  .to(".hero-subtitle", { y: -30, opacity: 0 }, 0.3);
```

### Cleanup Pattern (React)
```javascript
useEffect(() => {
  const ctx = gsap.context(() => {
    // All GSAP animations here
    gsap.to(".element", { ... });
    ScrollTrigger.create({ ... });
  }, containerRef); // Scope to container

  return () => ctx.revert(); // Clean up ALL animations
}, []);
```

---

## Rule 6: Lenis Integration

### Setup
```javascript
const lenis = new Lenis({
  duration: 1.2,           // Scroll duration
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
  infinite: false,
});
```

### GSAP + Lenis Sync
```javascript
// Connect Lenis to GSAP's ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
```

### Scroll-to with Lenis
```javascript
// Smooth scroll to element
lenis.scrollTo('#section-id', {
  offset: -100,        // Offset from top
  duration: 1.5,       // Animation duration
  easing: (t) => 1 - Math.pow(1 - t, 3), // Custom easing
});
```

---

## Rule 7: Image Transition Patterns

### Blur-Up Loading
```javascript
// 1. Show tiny blurred placeholder (inline base64, ~20px wide)
// 2. Load full image in background
// 3. Crossfade when loaded

const ImageWithBlur = ({ src, blurSrc, alt }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="relative overflow-hidden">
      {/* Blur placeholder - always visible initially */}
      <img 
        src={blurSrc} 
        className={`absolute inset-0 w-full h-full object-cover scale-110 blur-lg
          transition-opacity duration-500 ${loaded ? 'opacity-0' : 'opacity-100'}`}
      />
      {/* Full image */}
      <img 
        src={src}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover
          transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};
```

### Cover Art Parallax Tilt (Desktop)
```javascript
// Subtle 3D tilt on hover using mouse position
const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  
  setRotation({
    x: y * -10,  // Max 10deg rotation
    y: x * 10,
  });
};

// Apply with perspective
<motion.div
  style={{ 
    perspective: 1000,
    rotateX: rotation.x,
    rotateY: rotation.y,
  }}
  transition={{ type: "spring", stiffness: 150, damping: 15 }}
/>
```

---

## Rule 8: Performance Monitoring

### Runtime FPS Detection
```javascript
// If FPS drops below threshold, reduce animation complexity
let frameCount = 0;
let lastTime = performance.now();
let fps = 60;

function measureFPS() {
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastTime = now;
    
    if (fps < 30) {
      // Disable non-essential animations
      document.body.classList.add('reduce-motion');
    }
  }
  requestAnimationFrame(measureFPS);
}
```

### Animation Complexity Tiers
```
Tier 1 (Always active):
  - Page transitions
  - Basic hover states
  - Scroll reveals (simple fade)

Tier 2 (Disable below 45fps):
  - Parallax effects
  - Stagger animations
  - Complex hover effects

Tier 3 (Disable below 30fps or on mobile):
  - Particle effects
  - 3D transforms
  - Cursor effects
  - Background animations
```

---

## Rule 9: Accessibility Motion

### prefers-reduced-motion Implementation
```javascript
// Hook for reduced motion detection
const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);
  
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  return prefersReduced;
};

// Usage: conditionally apply animations
const variants = prefersReduced 
  ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
  : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
```

### What Reduced Motion Means
- ✅ Opacity transitions are OK (not motion)
- ✅ Color transitions are OK
- ❌ No translateX/Y/Z animations
- ❌ No scale animations
- ❌ No rotation
- ❌ No parallax
- ❌ No particles
- ✅ Instant state changes instead

---

## Rule 10: Animation Naming Convention

### CSS Animation Names
```
@keyframes shimmer-skeleton { }
@keyframes pulse-glow { }
@keyframes float-ambient { }
@keyframes gradient-shift { }
@keyframes fade-in { }
```

### Framer Motion Variant Names
```
variants = {
  hidden: { },      // Before animation
  visible: { },     // After animation (in view)
  exit: { },        // Leaving view/page
  hover: { },       // Hover state
  tap: { },         // Press state
  drag: { },        // Being dragged
}
```

### GSAP Label Convention
```
timeline.addLabel("section-enter")
timeline.addLabel("title-reveal")
timeline.addLabel("content-stagger")
timeline.addLabel("section-exit")
```

---

## Forbidden Patterns

| Pattern | Why It's Forbidden | Alternative |
|---------|-------------------|-------------|
| `animation-delay` in CSS for staggers | Can't be interrupted | Use GSAP stagger or Framer Motion custom delay |
| `transition: all` | Animates unintended properties | Specify exact properties |
| Animating `height: auto` | Causes layout thrash | Use `max-height` or Framer Motion layout |
| `position: fixed` animations | Jank on mobile Safari | Use `transform` to simulate |
| Infinite JS-driven loops | Memory leaks | Use CSS @keyframes for loops |
| `setTimeout` for sequencing | Unreliable timing | Use GSAP timeline or Framer Motion |
