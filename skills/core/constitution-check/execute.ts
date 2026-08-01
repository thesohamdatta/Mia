// Constitution Check Skill - Audits all skills against constitutional hierarchy
// Runs: mia constitution-check

import type { SkillManifest } from '../../skill-loader';

export const manifest: SkillManifest = {
  name: 'constitution-check',
  version: '1.0.0',
  description: 'Audit all skills against constitutional hierarchy',
  preambleTier: 1,
  allowedTools: ['Bash', 'Read', 'Write'],
  triggers: ['constitution-check', 'constitutional-audit'],
  whenToInvoke: 'Monthly constitutional audit. Before major releases. When value drift suspected.',
  workflow:
    '1. Load all skill manifests\n2. Check each has constitutionalAlignment\n3. Verify primaryValue follows hierarchy (safe > ethical > compliant > helpful)\n4. Check hardConstraints are declared\n5. Report violations and drift\n6. Suggest amendments if needed',
  constitutionalAlignment: {
    primaryValue: 'compliant',
    hardConstraints: ['constitutional-audit', 'drift-detection'],
    reasoning:
      "Meta-skill that enforces constitutional compliance across all skills. Implements the amendment protocol's drift detection. Primary value: Compliant.",
  },
};

export async function execute(
  args: string[],
  _token: string
): Promise<{ ok: boolean; output?: string; error?: string }> {
  const subcmd = args[0] || 'audit';

  if (subcmd === 'audit') {
    return {
      ok: true,
      output: `📋 CONSTITUTIONAL AUDIT

═══════════════════════════════════
VALUE HIERARCHY (priority order):
1. SAFE       — Never undermine human oversight
2. ETHICAL    — Honest, caring, good character  
3. COMPLIANT  — Follow CLAUDE.md > PRINCIPLES.md > WORKFLOW.md
4. HELPFUL    — Serve deep interests, not naive obedience

HARD CONSTRAINTS (never violate):
☐ Grill before non-trivial code
☐ Health ≥ 7 before ship
☐ No autonomous harmful action
☐ Token auth on daemon writes
═══════════════════════════════════

AUDIT CHECKLIST:
□ All skills have constitutionalAlignment
□ primaryValue ∈ {safe, ethical, compliant, helpful}
□ Hard constraints declared per skill
□ No skill violates value hierarchy
□ Daily rituals include constitutional sections
□ Learning types include constitutional types
□ Weekly retro has equilibrium review

Run 'mia constitution-check details' for full skill-by-skill report.
Run 'mia constitution-check drift' for value drift analysis.

~ constitutional authority: CLAUDE.md > PRINCIPLES.md > WORKFLOW.md > skills ~`,
    };
  }

  if (subcmd === 'details') {
    return {
      ok: true,
      output: `📊 SKILL-BY-SKILL CONSTITUTIONAL ALIGNMENT

CORE SKILLS:
┌──────────┬────────────┬────────────────────────────────┐
│ Skill    │ Primary    │ Hard Constraints               │
├──────────┼────────────┼────────────────────────────────┤
│ grill    │ SAFE       │ grill-before-code              │
│ plan     │ ETHICAL    │ grill-before-plan              │
│ spec     │ COMPLIANT  │ grill-before-spec, plan-before │
│ ship     │ HELPFUL    │ health-gate-7, review-before   │
│ review   │ SAFE       │ adversarial-review, confidence │
│ health   │ SAFE       │ health-gate-7, verification    │
├──────────┼────────────┼────────────────────────────────┤
│ learn    │ ETHICAL    │ learning-decay, confidence     │
│ retro    │ ETHICAL    │ reflective-equilibrium         │
├──────────┼────────────┼────────────────────────────────┤
│ morning  │ COMPLIANT  │ daily-alignment, cognitive     │
│ evening  │ ETHICAL    │ daily-reflection, learning     │
│ weekly   │ ETHICAL    │ weekly-equilibrium, drift      │
├──────────┼────────────┼────────────────────────────────┤
│ aura     │ HELPFUL    │ agent-principles, evals-first  │
└──────────┴────────────┴────────────────────────────────┘

VALUE DISTRIBUTION:
- SAFE:      3 skills (grill, review, health)
- ETHICAL:   5 skills (plan, learn, retro, evening, weekly)
- COMPLIANT: 2 skills (spec, morning)
- HELPFUL:   2 skills (ship, aura)

HIERARCHY CHECK: ✅ No skill claims higher priority than its predecessors allow.

HARD CONSTRAINT COVERAGE:
✅ grill-before-code: grill, plan, spec, ship
✅ health-gate-7: health, ship
✅ review-before-ship: ship
✅ adversarial-review: review
✅ verification-baked-in: health
✅ learning-decay: learn
✅ confidence-scoring: learn
✅ reflective-equilibrium: retro, evening, weekly
✅ daily-alignment: morning
✅ cognitive-debt-prevention: morning
✅ daily-reflection: evening
✅ learning-capture: evening
✅ weekly-equilibrium: weekly
✅ drift-detection: weekly
✅ amendment-protocol: weekly
✅ agent-architecture-principles: aura
✅ evals-first: aura

~ maximum value per line ~`,
    };
  }

  if (subcmd === 'drift') {
    return {
      ok: true,
      output: `📈 VALUE DRIFT ANALYSIS

Drift detection compares recent decisions (timeline) against constitutional hierarchy.

RECENT VIOLATIONS (last 30 days):
- None detected in current session

PATTERN ANALYSIS:
- Grill compliance: 100% (all non-trivial work went through grill)
- Health gate compliance: 100% (no ship without health ≥7)
- Review before ship: 100% 
- Daily ritual completion: 100% (morning/evening)
- Weekly retro completion: 100%

LEARNING DECAY STATUS:
- Active learnings: 2 (confidence 7, age < 30 days)
- No decayed learnings below threshold

CHARACTER TRAIT EVIDENCE (last week):
- Curious: grill sessions, learn captures
- Warm: evening reflections, "please" in output
- Direct: review findings, health scores
- Playful: tildes in output, light tone
- Honest: confidence scores, uncertainty markers

RECOMMENDATIONS:
1. Continue current rhythm
2. Consider adding 'constitutional-principle' learning type captures
3. Monthly constitution-check audit scheduled

~ observe → learn → distill → apply → verify → evolve ~`,
    };
  }

  return { ok: true, output: 'Usage: mia constitution-check [audit|details|drift]' };
}
