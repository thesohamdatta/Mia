---
name: learn
preamble-tier: 2
version: 1.0.0
description: Manage project learnings (list, add, search)
allowed-tools:

  - Bash


  - Read


  - Write

triggers:

  - learn


  - show learnings


  - what have we learned

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

When asked about past patterns, or proactively after completing a session. Every session should end with learnings captured.

## Workflow

1. Run 'mia learn list' to see existing
2. Add new: 'mia learn add <skill> <type> <key> <insight>'
3. Types: pattern, pitfall, preference, architecture, tool, constitutional-principle, character-trait, psychological-insight
4. Confidence auto-decays 1pt per 30 days

---

*Auto-generated from skill template. Run `mia gen:skill-docs` to regenerate.*