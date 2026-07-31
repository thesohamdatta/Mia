---
name: retro
preamble-tier: 2
version: 1.0.0
description: Weekly retrospective with timeline + learnings
allowed-tools:

  - Bash


  - Read


  - Write


  - AskUserQuestion

triggers:

  - retro


  - weekly retro


  - retrospective

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

End of work week or sprint. Proactively suggest every Friday. Combines timeline events + learnings + reflection.

## Workflow

1. Auto-loads recent timeline (20 events) and learnings (10)
2. Guided reflection: what went well, what to improve, next steps
3. Outputs structured retro for memory.md
4. Can fold into long-term memory

---

*Auto-generated from skill template. Run `mia gen:skill-docs` to regenerate.*