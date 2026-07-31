---
name: grill
preamble-tier: 1
version: 1.0.0
description: Start a clarification interview (golden rule enforcement)
allowed-tools:

  - Bash


  - Read


  - Write


  - AskUserQuestion

triggers:

  - grill


  - clarify


  - before coding

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

ALWAYS before any non-trivial implementation. Golden Rule: Never jump to code without a grill session.

## Workflow

1. State the problem in one sentence
2. List assumptions
3. Identify risks
4. Define 'done' criteria
5. Get human approval before proceeding

---

*Auto-generated from skill template. Run `mia gen:skill-docs` to regenerate.*