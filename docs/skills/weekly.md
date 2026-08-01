---
name: weekly
preamble-tier: 1
version: 1.0.0
description: Weekly retrospective - trends, patterns, strategy
allowed-tools:

  - Bash


  - Read


  - Write

triggers:

  - weekly


  - weekly retro


  - sprint retro

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

End of each week. Deep retrospective with trend analysis.

## Workflow

1. Aggregate daily reflections
2. Analyze learnings trends
3. Review health metrics
4. Identify patterns (good/bad)
5. Set next week's focus
6. Update long-term memory

## Reflective Equilibrium Review
- Value drift detection: compare this week's decisions to hierarchy
- Hard constraint violations: count + root cause
- Character growth: evidence of curiosity, warmth, directness, honesty
- Constitutional amendments needed: [yes/no] → if yes, create ADR

---

*Auto-generated from skill template. Run `mia gen:skill-docs` to regenerate.*