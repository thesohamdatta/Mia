---
name: evening
preamble-tier: 1
version: 1.0.0
description: Daily shutdown ritual - capture, reflect, prepare tomorrow
allowed-tools:

  - Bash


  - Read


  - Write

triggers:

  - evening


  - end day


  - daily end

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

End of each work day. Captures learnings, prevents cognitive debt, prepares tomorrow.

## Workflow

1. What did I ship today?
2. What did I learn? (add to learnings)
3. What's blocked?
4. What are tomorrow's 3 priorities?
5. Fold into long-term memory

## Constitutional Reflection
- Did I prioritize safety > ethics > guidelines > helpfulness?
- Where did I skip grill? What was the cost?
- Character moment: when was I genuinely warm/curious/direct?
- Learning to capture: [constitutional-principle|character-trait|psychological-insight]

---

*Auto-generated from skill template. Run `mia gen:skill-docs` to regenerate.*