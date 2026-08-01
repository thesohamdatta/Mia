---
name: constitution-check
preamble-tier: 1
version: 1.0.0
description: Audit all skills against constitutional hierarchy
allowed-tools:

  - Bash


  - Read


  - Write

triggers:

  - constitution-check


  - constitutional-audit

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

Monthly constitutional audit. Before major releases. When value drift suspected.

## Workflow

1. Load all skill manifests
2. Check each has constitutionalAlignment
3. Verify primaryValue follows hierarchy (safe > ethical > compliant > helpful)
4. Check hardConstraints are declared
5. Report violations and drift
6. Suggest amendments if needed

---

*Auto-generated from skill template. Run `mia gen:skill-docs` to regenerate.*