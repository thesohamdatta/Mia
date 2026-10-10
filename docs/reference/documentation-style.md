# Writing documentation for MIA

MIA's documentation should be as deliberate as its code: useful to a reader, honest about evidence, and cheap to maintain.

## Start with the reader's task

Before writing, finish this sentence:

> After reading this page, the reader can…

Give each page one primary job. Move secondary topics to an existing page when they belong there; create a new page only when it answers a distinct question.

## Choose the right shape

- **Guide:** steps that help someone complete a task.
- **Concept:** an explanation of how something works or why a decision was made.
- **Reference:** precise details someone needs to look up.
- **Troubleshooting:** a symptom, likely causes, and a diagnostic path.

Do not turn every idea into its own short page. Combine closely related facts when that makes the reader's job easier.

## Write for clarity

- Lead with the answer or purpose.
- Use direct, concrete language and active voice.
- Keep paragraphs focused on one idea.
- Use headings that describe the content below them.
- Prefer examples tied to the current code over generic advice.
- Remove filler, repeated summaries, vague superlatives, and slogans that carry no information.
- Define project-specific terms the first time readers need them.

## Make visuals earn their space

GitHub renders Mermaid diagrams in Markdown. Use Mermaid for architecture, execution flow, and state transitions instead of hand-drawn ASCII boxes. Keep diagrams small enough to understand at a glance; explain non-obvious edges in the surrounding text.

Use tables when readers need to compare items with the same attributes. Use lists for parallel items. Use prose for explanations and reasoning.

## Keep claims verifiable

- Check command examples against the executable registry and implementation.
- Check configuration claims against the active code path and tests.
- Link to accepted ADRs for important decisions.
- Do not invent performance numbers, confidence scores, evaluation weights, or compatibility claims.
- Distinguish implemented behaviour from proposals and future ideas.
- State what a verification command proves, and avoid claiming it proves more than it does.

## Keep navigation predictable

Prefer a shallow hierarchy and stable links. Update the documentation index when adding or moving a page. Avoid duplicating a canonical explanation in several files; link to the owner instead.

## Before opening a pull request

- [ ] The page has one clear purpose and fits the intended reader.
- [ ] Commands and paths were checked against the current repository.
- [ ] Links point to real files or valid external pages.
- [ ] Mermaid diagrams use GitHub-supported syntax.
- [ ] No internal state, secrets, or machine-specific notes were copied into reader-facing docs.
- [ ] Markdown checks pass.
