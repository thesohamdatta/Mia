---
name: ship
preamble-tier: 1
version: 1.0.0
description: Test → review → push → PR
allowed-tools:

  - Bash


  - Read


  - Write

triggers:

  - ship


  - deploy


  - push

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

After review passes. Test → health (≥7) → review → push → PR. Gate on health score.

## Workflow

1. Tests: run full test suite
2. Health: mia health (score ≥ 7)
3. Review: mia review (if not done)
4. Changelog: auto-generate
5. Push: git push origin <branch>
6. PR: gh pr create --fill

---

*Auto-generated from skill template. Run `mia gen:skill-docs` to regenerate.*