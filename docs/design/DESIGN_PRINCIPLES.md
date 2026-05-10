# Design Principles — Comic Curated

## The Ten Commandments

These principles govern every design decision. When in doubt, refer back to these.

---

### 1. Cinema Over Dashboard

Every layout decision should ask: "Does this feel like a scene in a film, or a row in a spreadsheet?"

- Sections are compositions, not containers
- Whitespace is intentional, not leftover
- Visual hierarchy is dramatic, not incremental
- The eye should travel a deliberate path

**Test:** Screenshot any section. Does it look like it could be a frame from an anime opening? If not, redesign.

---

### 2. Emotion Over Information

The primary goal is to make visitors *feel* something. Information delivery is secondary.

- A title's cover should evoke the mood of reading it
- Statistics should tell a story, not just display numbers
- Navigation should feel like exploration, not utility
- Even error states should have personality

**Test:** Can a visitor who doesn't read comics still be impressed? If yes, the emotion is working.

---

### 3. Smoothness Over Spectacle

A butter-smooth 60fps experience with subtle animations beats a janky experience with flashy effects.

- Prefer opacity/transform animations (GPU-accelerated)
- Never sacrifice scroll smoothness for visual flair
- If an animation causes a single frame drop, simplify it
- Motion should feel effortless, not labored

**Test:** Scroll rapidly through any page. Is it perfectly smooth? If not, reduce effects until it is.

---

### 4. Asymmetry Over Uniformity

Uniform grids are boring. Intentional asymmetry creates visual interest and hierarchy.

- Vary card sizes based on content importance
- Break grid alignment deliberately
- Use overlapping elements to create depth
- Let some elements breathe more than others

**Test:** Cover the content. Does the layout itself have visual rhythm? If it's a flat grid, redesign.

---

### 5. Depth Over Flatness

The interface should feel like it has physical depth — layers you could reach into.

- Background layers move at different speeds (parallax)
- Elements cast shadows that respond to context
- Blur creates atmospheric depth
- Z-index is a design tool, not just a stacking utility

**Test:** Squint at the screen. Can you perceive at least 3 depth layers? If not, add depth.

---

### 6. Reveal Over Display

Don't show everything at once. Let content reveal itself through interaction and scroll.

- Stagger element appearances
- Use scroll-triggered animations
- Progressive disclosure on hover/click
- Hidden details reward curious visitors

**Test:** Does the page feel different after 5 seconds of interaction vs. initial load? If not, add reveals.

---

### 7. Personality Over Polish

A site with rough edges but genuine personality beats a perfectly polished but soulless template.

- Writing should be casual and authentic
- Categories should use personal language ("Brainrot", not "Light Reading")
- Visual choices should reflect personal taste
- Imperfection in the right places adds charm

**Test:** Could this section exist on any other website? If yes, it lacks personality.

---

### 8. Cohesion Over Variety

While sections should feel distinct, they must belong to the same visual universe.

- Consistent color temperature across the site
- Shared motion language (easing curves, durations)
- Typography hierarchy is universal
- Spacing system is mathematical and consistent

**Test:** Place any two sections side by side. Do they clearly belong to the same site? If not, unify.

---

### 9. Performance Over Perfection

A fast site with 90% of the vision beats a slow site with 100%.

- Every visual choice has a performance budget
- Lazy load aggressively
- Prefer CSS animations over JS where possible
- Optimize images ruthlessly
- Test on mid-range devices, not just MacBook Pros

**Test:** Load the site on a 3-year-old phone with 4G. Is it still enjoyable? If not, optimize.

---

### 10. Mobile-Worthy, Desktop-Cinematic

Mobile isn't a degraded desktop experience — it's a focused, intentional experience. Desktop isn't bloated mobile — it's an expanded cinematic canvas.

- Mobile: prioritize content, reduce ambient effects, optimize touch
- Desktop: expand compositions, add depth effects, enable hover magic
- Both should feel intentional and complete
- Neither should feel like an afterthought

**Test:** Use the mobile version for a full session. Does it feel like a first-class experience? If not, redesign for mobile specifically.

---

## Design Decision Framework

When making any design choice, run it through this priority stack:

```
1. Does it serve the user's goal? (functional)
2. Does it evoke emotion? (experiential)
3. Does it perform well? (technical)
4. Does it maintain cohesion? (systematic)
5. Does it add personality? (identity)
```

If a choice fails at level 1, reject it regardless of how cool it looks.
If a choice passes 1-3 but fails 4, adjust it to fit the system.
If a choice passes 1-4 but lacks 5, consider if personality can be added without compromising the above.

---

## Anti-Patterns Reference

### Layout Anti-Patterns
- ❌ Uniform 3-column card grid
- ❌ Sidebar + main content dashboard
- ❌ Hero → features → testimonials → CTA (SaaS pattern)
- ❌ Sticky header that takes 80px of vertical space
- ❌ Footer with 4 columns of links

### Visual Anti-Patterns
- ❌ Pure white backgrounds
- ❌ Generic box shadows (0 4px 6px rgba(0,0,0,0.1))
- ❌ Rounded corners on everything (border-radius: 8px everywhere)
- ❌ Stock photography
- ❌ Generic icon libraries used without customization

### Motion Anti-Patterns
- ❌ Bounce animations on everything
- ❌ Slow fade-ins that make the site feel sluggish
- ❌ Animations that block interaction
- ❌ Motion that doesn't serve a purpose
- ❌ Inconsistent easing curves

### Typography Anti-Patterns
- ❌ Single font weight used everywhere
- ❌ Body text smaller than 16px on mobile
- ❌ Centered text in long paragraphs
- ❌ ALL CAPS used without intention
- ❌ More than 3 font families
