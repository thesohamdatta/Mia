---
title: "Getting started"
layer: 1
last_updated: "2026-10-10"
owner: documentation
---

# Getting started

This guide takes you from a fresh checkout to running the MIA CLI. MIA is developed with Bun and TypeScript; the repository scripts are the reliable entry point.

## Requirements

- Git
- [Bun](https://bun.sh/) compatible with the version pinned in `package.json`

## 1. Clone the repository

```bash
git clone https://github.com/thesohamdatta/Mia.git
cd Mia
```

## 2. Install dependencies

```bash
bun install
```

## 3. Inspect the command surface

```bash
bun run core/cli/index.ts --help
```

MIA registers its commands explicitly. The output from your checkout is the best way to see exactly which commands that version provides.

## 4. Run a first command

Start a clarification session:

```bash
bun run core/cli/index.ts grill start
```

To see the questions template instead, run:

```bash
bun run core/cli/index.ts grill questions
```

For a plan, provide an objective:

```bash
bun run core/cli/index.ts plan create "Describe the change you want to make"
```

The plan skill creates a durable Work record and writes a project plan. Inspect the generated output before proceeding; plans are a starting point for deliberate work, not proof that implementation is complete.

## Optional: build the CLI

```bash
bun run build
```

This runs the repository's compiled-binary build script. For development and command exploration, the TypeScript entry point above is sufficient.

## Local state

The current CLI uses `MIA_DIR` as its state root. When it is not set, the default is `~/.mia`. MIA derives project, skills, memory, and session paths from this root.

For details and limits, see [Configuration](reference/configuration.md) and [Architecture](core/architecture.md).

## If something fails

1. Confirm that you're in the repository directory.
2. Check the installed Bun version against `package.json`.
3. Run `bun install` again if dependencies are missing.
4. Read the exact error output before changing configuration.
5. Use [Testing and verification](reference/testing-strategy.md) to run the relevant checks.

Don't assume a global `mia` command is installed. These examples invoke the CLI through Bun from the repository.
