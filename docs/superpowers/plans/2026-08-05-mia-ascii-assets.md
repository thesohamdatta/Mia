# MIA ASCII Assets & Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a visually stunning suite of ASCII assets for **MIA**—including raw text, animated SVG video banner, interactive HTML5 video studio, standalone SVG image, and a Python Manim animation video—all in exact crimson red (`#B61C1C`).

**Architecture:** 
1. `docs/assets/mia-ascii.txt` & `docs/assets/mia-ascii.svg`: Static multi-layer 3D ASCII text art in `#B61C1C`.
2. `docs/assets/ascii-studio.html`: HTML5 Canvas studio rendering real-time matrix video wave dynamics through ASCII "MIA" lettering.
3. `docs/assets/mia-ascii-banner.svg`: Self-contained animated vector SVG for GitHub `README.md`.
4. `scripts/render_mia_manim.py`: Python Manim Scene rendering dynamic vector/ASCII transformation to MP4/GIF.
5. `README.md`: Integration of the `#B61C1C` ASCII hero banner.

**Tech Stack:** HTML5 Canvas, SVG with CSS Keyframes, Vanilla CSS/JS, Python (Manim Community Edition).

## Global Constraints
- Primary Accent Hex: `#B61C1C`
- Highlight Hex: `#FF3E3E`
- Dark Ambient Hex: `#0A0A0D`
- All files located inside `D:/PROJECTS/Mia`

---

### Task 1: Static ASCII Text & Crisp SVG Image Asset

**Files:**
- Create: `docs/assets/mia-ascii.txt`
- Create: `docs/assets/mia-ascii.svg`

**Interfaces:**
- Produces: Base 3D MIA ASCII character matrix string & styled vector graphic.

- [ ] **Step 1: Create raw ASCII text asset (`docs/assets/mia-ascii.txt`)**
- [ ] **Step 2: Create styled SVG image asset (`docs/assets/mia-ascii.svg`) with `#B61C1C` theme**
- [ ] **Step 3: Verify rendering of SVG in browser**
- [ ] **Step 4: Commit Task 1**

---

### Task 2: Interactive HTML5 ASCII Video Studio

**Files:**
- Create: `docs/assets/ascii-studio.html`

**Interfaces:**
- Produces: Real-time web studio with Canvas ASCII video matrix animation in `#B61C1C`, speed/glitch controls, and SVG/PNG exporter.

- [ ] **Step 1: Build HTML structural layout and CSS styling (`#0A0A0D` dark obsidian + `#B61C1C` crimson)**
- [ ] **Step 2: Implement HTML5 Canvas ASCII text & matrix video wave animation engine**
- [ ] **Step 3: Add interactive UI controls (matrix speed, density, glitch effect, color mode)**
- [ ] **Step 4: Verify interactive studio in browser**
- [ ] **Step 5: Commit Task 2**

---

### Task 3: Animated SVG ASCII Banner for GitHub README

**Files:**
- Create: `docs/assets/mia-ascii-banner.svg`

**Interfaces:**
- Consumes: ASCII layout from Task 1
- Produces: Self-contained GitHub-compatible animated SVG with `@keyframes` matrix wave pulse.

- [ ] **Step 1: Build SVG document with embedded CSS `@keyframes` frame matrix animation**
- [ ] **Step 2: Add high-glow `#B61C1C` ASCII glyph paths and pulsing background particles**
- [ ] **Step 3: Verify standalone SVG animation in browser**
- [ ] **Step 4: Commit Task 3**

---

### Task 4: Manim Python Video Animation Script

**Files:**
- Create: `scripts/render_mia_manim.py`
- Create: `scripts/run_manim.bat`

**Interfaces:**
- Produces: Manim scene `MIAAsciiAnimation` rendering a mathematical line-by-line assembly of the MIA ASCII text in `#B61C1C`.

- [ ] **Step 1: Create Manim Python script with `Text`, `VGroup`, `Create`, and `Transform` effects in `#B61C1C`**
- [ ] **Step 2: Create batch script runner to execute Manim render to MP4/GIF**
- [ ] **Step 3: Test and verify Manim script syntax**
- [ ] **Step 4: Commit Task 4**

---

### Task 5: GitHub README Integration & Final Verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: `docs/assets/mia-ascii-banner.svg`

- [ ] **Step 1: Update `README.md` hero section with the `#B61C1C` MIA ASCII Hero Banner**
- [ ] **Step 2: Verify `README.md` formatting**
- [ ] **Step 3: Run full asset validation**
- [ ] **Step 4: Commit Task 5**
