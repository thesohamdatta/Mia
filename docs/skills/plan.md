---
name: plan
preamble-tier: 1
version: 1.0.0
description: Create a verifiable plan with success criteria
allowed-tools:

  - Bash


  - Read


  - Write


  - AskUserQuestion

triggers:

  - plan


  - create plan


  - planning

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

After grill, before any implementation. Verifiable plan with success criteria before implementing.

## Workflow

1. Define success criteria (measurable)
2. Break into atomic steps
3. Identify dependencies and risks
4. Estimate effort per step
5. Human approves plan before execution

---

*Auto-generated from skill template. Run `mia gen:skill-docs` to regenerate.*