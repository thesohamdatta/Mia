# Design Spec: MIA ASCII Animation (#B61C1C) README Banner

**Date:** 2026-08-05  
**Project:** Mia (Machine Intelligence Architecture)  
**Topic:** ASCII Animation Hero Banner & Web Studio  

---

## 1. Overview & Objective
Create an ASCII animation featuring the name **MIA** with video-like dynamic matrix wave effects in exact crimson red (`#B61C1C`). The final output includes a GitHub README hero banner (Animated SVG/GIF) and an interactive web studio in `docs/assets/ascii-studio.html` for previewing and customizing the animation.

---

## 2. Visual & Aesthetics Requirements
- **Color Palette:**
  - Base Crimson: `#B61C1C`
  - Highlighting / Peak: `#FF3E3E`
  - Ambient Glow / Shading: `#5C0E0E`, `#2B0707`
  - Background: Obsidian Dark (`#0A0A0D`) with transparent fallback for GitHub Dark mode.
- **Typography & Glyphs:** Monospace ASCII character set (`@`, `#`, `$`, `%`, `*`, `+`, `=`, `:`, `.`, `space`).
- **Animation Motion:** 
  - 3D ASCII "MIA" typography floating/pulsing.
  - Video matrix rain / fluid dynamic wave passing through letters.
  - Subtle glitch and glow shimmer effects.

---

## 3. Deliverables & File Structure
1. `docs/assets/ascii-studio.html`
   - Standalone HTML5 Canvas renderer & control panel.
   - Live controls: speed, density, glitch factor, video matrix mode, frame exporter.
2. `docs/assets/mia-ascii-banner.svg`
   - Pure animated SVG with CSS keyframes / frame animation in `#B61C1C` for GitHub README compatibility.
3. `README.md`
   - Header updated to feature the `#B61C1C` MIA ASCII Hero Banner.

---

## 4. Verification & Testing Criteria
- `docs/assets/ascii-studio.html` loads cleanly in browser and renders `#B61C1C` ASCII video animation at 60 FPS.
- `docs/assets/mia-ascii-banner.svg` renders crisply on GitHub markdown preview.
- `README.md` visually showcases the hero banner correctly.
