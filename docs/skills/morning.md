---
name: morning
preamble-tier: 1
version: 1.0.0
description: Daily startup ritual - context, priorities, learnings
allowed-tools:

  - Bash


  - Read


  - Write

triggers:

  - morning


  - start day


  - daily start

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

First thing each work day. Loads context, sets priorities, prevents cognitive debt.

## Workflow

1. Load long-term memory
2. Show recent learnings
3. Check timeline for yesterday
4. Set 3 priorities for today
5. Check calendar/health

## Constitutional Alignment Check
- Primary value for today: [safe|ethical|compliant|helpful]
- Hard constraint reminder: grill before code, health ≥7 to ship
- Character intention: [curious|warm|direct|playful|honest]

---

*Auto-generated from skill template. Run `mia gen:skill-docs` to regenerate.*