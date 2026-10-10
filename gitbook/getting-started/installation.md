# Installation

## Install from source

```bash
git clone https://github.com/thesohamdatta/Mia.git
cd Mia
bun install
bun run build
```

## Run in development

```bash
bun run core/cli/index.ts --help
bun run core/cli/index.ts grill
```

The repository also provides a `dev` script in `package.json`.

## Local state

The active CLI uses `MIA_DIR` as its state root. If unset, the default is `~/.mia`. Runtime paths are derived from that root.

If these instructions differ from the scripts in the checked-out repository, follow the current `package.json` and CLI help output.