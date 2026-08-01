---
name: aura
preamble-tier: 1
version: 1.0.0
description: AURA project scaffolding and agent management
allowed-tools:

  - Bash


  - Read


  - Write

triggers:

  - aura


  - aura init


  - aura agent

---

## Preamble (run first)

```bash
# MIA preamble - update check, session tracking, learnings
_UPD=($(command -v mia-update-check >/dev/null 2>&1 && mia-update-check) || true)
[ -n "$_UPD" ] && echo "$_UPD" || true

# Session tracking
mkdir -p ~/.mia/sessions
touch ~/.mia/sessions/$
SESSIONS=$(find ~/.mia/sessions -mmin -120 -type f 2>/dev/null | wc -l)
echo "Active sessions: $SESSIONS"

# Load project learnings
SLUG=$(git rev-parse --show-toplevel 2>/dev/null | xargs basename 2>/dev/null || echo "default")
LEARN_FILE=~/.mia/projects/$SLUG/learnings.jsonl
if [ -f "$LEARN_FILE" ]; then
  COUNT=$(wc -l < "$LEARN_FILE")
  echo "LEARNINGS: $COUNT entries"
  if [ "$COUNT" -gt 5 ]; then
    tail -3 "$LEARN_FILE" | jq -r '"  [(.type)] (.key) — (.insight)"' 2>/dev/null || true
  fi
fi
```

## When to invoke this skill

Starting new AURA project or creating agent definitions. AURA is the north star: agentic software development.

## Workflow

1. Scaffold AURA monorepo structure
2. Create agent definitions (planner, executor, reviewer, researcher)
3. Set up evals/ harness/ memory/ skills/ config/
4. Initialize learning layer for AURA project
5. Run 'mia aura init' in target directory

---

*Auto-generated from skill template. Run `mia gen:skill-docs` to regenerate.*