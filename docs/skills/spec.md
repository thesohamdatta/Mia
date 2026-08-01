---
name: spec
preamble-tier: 1
version: 1.0.0
description: Turn intent into PRD → issues
allowed-tools:

  - Bash


  - Read


  - Write


  - AskUserQuestion

triggers:

  - spec


  - prd


  - specification

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

After plan, before TDD. Convert intent to formal PRD with acceptance criteria.

## Workflow

1. Problem statement
2. User stories with acceptance criteria
3. Technical approach
4. Risks and mitigations
5. Break into atomic, independently-shippable issues

---

*Auto-generated from skill template. Run `mia gen:skill-docs` to regenerate.*