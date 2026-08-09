# Design System — EKB

## Product Context
- **What this is:** Engineering Knowledge Base for AI-assisted software development
- **Who it's for:** AI agents and human engineers building software systems
- **Space/industry:** Developer tools, AI engineering, software architecture
- **Project type:** Knowledge system / operating system for engineering judgment

## Aesthetic Direction
- **Direction:** Clean, functional, engineering-first — clarity over decoration
- **Decoration level:** Minimal — subtle structure for readability
- **Mood:** Serious engineering tool built by people who care about craft
- **Reference:** Linear (restrained), GitHub Primer (functional), technical documentation sites

## Typography
- **Display/Hero:** System UI font stack — native, performant, familiar
- **Body:** System UI font stack — clean, readable
- **UI/Labels:** System UI font stack
- **Data/Tables:** Monospace (JetBrains Mono, Fira Code, or system monospace)
- **Code:** Monospace
- **Scale:**
  - H1: 2.5rem / 40px
  - H2: 2rem / 32px
  - H3: 1.5rem / 24px
  - H4: 1.25rem / 20px
  - Body: 1rem / 16px
  - Small: 0.875rem / 14px
  - Caption: 0.75rem / 12px

## Color
- **Approach:** Semantic, accessible, dark-mode default
- **Primary:** Blue #3B82F6 — trustworthy, technical
- **Success:** Green #22C55E
- **Warning:** Amber #F59E0B
- **Error:** Red #EF4444
- **Info:** Blue #3B82F6
- **Neutrals (Dark):**
  - Base: #0C0C0C
  - Surface: #141414
  - Border: #262626
  - Text: #FAFAFA
  - Muted: #71717A
- **Neutrals (Light):**
  - Base: #FAFAF9
  - Surface: #FFFFFF
  - Border: #E7E5E4
  - Text: #18181B
  - Muted: #71717A

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable — not cramped, not spacious
- **Scale:** 2px, 4px, 8px, 16px, 24px, 32px, 48px, 64px

## Layout
- **Approach:** Grid-disciplined for dashboards, readable prose for docs
- **Grid:** 12 columns at desktop, 1 column at mobile
- **Max content width:** 800px for prose, 1200px for dashboards
- **Border radius:** sm:4px, md:8px, lg:12px, full:9999px
  - Cards/panels: lg (12px)
  - Buttons/inputs: md (8px)
  - Badges/pills: full (9999px)

## Motion
- **Approach:** Minimal-functional — only transitions that aid comprehension
- **Duration:** fast(100ms), normal(200ms), slow(300ms)
- **Animated elements:** hover states, focus rings, loading states

## Components

### Card
```markdown
## Title

Content with clear hierarchy.
```

### Badge
```markdown
`STATUS` `PRIORITY` `LAYER`
```

### Code Block
```language
# With language hint
code_here()
```

### Table
| Column | Column | Column |
|--------|--------|--------|
| Data   | Data   | Data   |

### Callout
> **Note:** Important information that stands out.

> **Warning:** Critical warning that requires attention.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-31 | System UI font stack | Native, performant, no layout shift |
| 2026-07-31 | Dark mode default | Reduces eye strain, technical audience |
| 2026-07-31 | 800px max width for prose | Optimal reading line length |
| 2026-07-31 | Semantic color tokens | Accessible, themeable, meaningful |

## Markdown Conventions

### Headings
```markdown
# H1 — Document title (one per file)
## H2 — Major section
### H3 — Subsection
#### H4 — Detail level
```

### Lists
```markdown
- Bullet for unordered
- Keep parallel structure
- One concept per item

1. Numbered for sequence
2. Steps in a process
3. Ranked items
```

### Links
```markdown
[Descriptive text](path) — never "click here"
<https://example.com> — raw URLs in angle brackets for Discord
```

### Emphasis
```markdown
**Bold** for key terms, **first mention** of concepts
*Italic* for emphasis, *foreign words*
`Code` for commands, paths, tokens, CLI flags
```

### Frontmatter (for skills)
```yaml
---
name: skill-name
description: Use when [trigger phrase]. What it does.
version: 1.0.0
triggers:
  - trigger phrase
  - another trigger
---
```

## File Naming
- `kebab-case.md` for all files
- Descriptive but concise: `architecture.md` not `system-architecture-patterns.md`
- Index files: `README.md` or `index.md` in folders

## Accessibility
- Sufficient contrast (WCAG AA minimum)
- Semantic heading structure
- Alt text for images (when used)
- Focus visible for interactive elements