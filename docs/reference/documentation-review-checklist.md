---
title: "Documentation review checklist"
layer: 3
last_updated: "2026-10-10"
owner: documentation
---

# Documentation review checklist

Use this checklist when a change adds, removes, or alters user-facing behaviour.

## Reader and structure

- [ ] The page's intended reader and primary task are clear.
- [ ] The answer appears near the top.
- [ ] The page has one main purpose and a useful title.
- [ ] The navigation index and related links are updated.
- [ ] Existing content is linked instead of duplicated where practical.

## Accuracy

- [ ] Commands match the registered CLI and current implementation.
- [ ] Configuration matches the active execution path.
- [ ] Architecture statements match source and accepted decisions.
- [ ] Proposed behaviour is clearly labelled as proposed.
- [ ] External factual claims include a relevant source where needed.

## Writing and design

- [ ] Sentences are direct and paragraphs focus on one idea.
- [ ] Headings describe the content beneath them.
- [ ] Tables are used for real comparisons, not decoration.
- [ ] Diagrams improve understanding and use Mermaid where suitable.
- [ ] Generic filler, repeated slogans, vague claims, and unverified metrics are removed.
- [ ] Links use descriptive text and resolve to the intended destination.

## Validation

- [ ] Markdown lint passes.
- [ ] Changed paths and internal links were checked.
- [ ] Relevant tests or verification checks were run.
- [ ] The pull request states exactly what was checked and what remains unverified.
