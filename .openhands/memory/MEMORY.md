# Project memory

## MIA runtime
- MIA is a Bun CLI; entrypoint `core/cli/index.ts`, run with `bun run core/cli/index.ts <skill>`. No HTTP daemon.
- Skills live in `core/skills/<name>/` (`index.ts` registry, `execute.ts` logic). Agent-facing adapters are generated into `.agents/skills/{plan,review,ship}/SKILL.md`.
- `mia plan create "<objective>"` persists to `~/.mia/projects/<slug>/PLAN.md` (outside the repo), not `plan/`.

## Sandbox environment quirks
- Bun is not preinstalled. Install from the official GitHub release zip (no `unzip` in image) into `~/.local/bin`:
  `curl -fsSL -o bun.zip https://github.com/oven-sh/bun/releases/download/bun-v<ver>/bun-linux-x64.zip` then extract with `python3 -c "import zipfile;zipfile.ZipFile('bun.zip').extractall('.')"`.
- `npm install -g bun` fails with EPERM/EACCES on this image; use the release binary instead.

## OpenHands SDK
- Install `openhands-sdk` and `openhands-tools` in one pip command (matched versions). Verified working: v1.53.0 on python3.13 venv.
- `OPENHANDS_API_KEY` in the sandbox is a Cloud API key, not a LiteLLM proxy virtual key, so passing it as `LLM_API_KEY` fails auth. The managed-key refresh endpoint (`$OH_LLM_API_KEY_REFRESH_URL`) needs a session key header we do not hold here, so live LLM runs are blocked in-sandbox. Code must degrade gracefully when the LLM call fails.
- Set `OPENHANDS_SUPPRESS_BANNER=1` to hide the SDK startup banner in scripted runs.
