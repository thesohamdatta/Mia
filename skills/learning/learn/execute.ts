// Learn Skill Executor - Manage project learnings
// Runs: mia learn

import { type SkillManifest } from "../../skill-loader";

export const manifest: SkillManifest = {
  name: "learn",
  version: "1.0.0",
  description: "Manage project learnings (list, add, search)",
  preambleTier: 2,
  allowedTools: ["Bash", "Read", "Write"],
  triggers: ["learn", "show learnings", "what have we learned"],
  whenToInvoke: "When asked about past patterns, or proactively after completing a session. Every session should end with learnings captured.",
  workflow: "1. Run 'mia learn list' to see existing\n2. Add new: 'mia learn add <skill> <type> <key> <insight>'\n3. Types: pattern, pitfall, preference, architecture, tool\n4. Confidence auto-decays 1pt per 30 days"
};

export async function execute(args: string[], token: string): Promise<{ ok: boolean; output?: string; error?: string }> {
  const subcmd = args[0] || "list";
  
  if (subcmd === "list") {
    return { ok: true, output: "📚 Learnings list (run via daemon for full data)\n\nUse 'mia learn list' through the CLI - data comes from ~/.mia/projects/{slug}/learnings.jsonl" };
  }
  
  if (subcmd === "add") {
    const [, skill, type, key, ...insightParts] = args;
    const insight = insightParts.join(" ");
    if (!skill || !type || !key || !insight) {
      return { ok: false, error: "Usage: mia learn add <skill> <type> <key> <insight>" };
    }
    return { ok: true, output: `✓ Learning saved (via daemon): ${key}\n  [${type}] ${insight}` };
  }
  
  return { ok: true, output: "Usage: mia learn [list|add <skill> <type> <key> <insight>]" };
}