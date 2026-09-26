import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

describe('Markdown engineering contract', () => {
  it('keeps AGENTS.md as a small router, not a knowledge dump', () => {
    const lines = read('AGENTS.md').trim().split('\n');
    expect(lines.length).toBeLessThanOrEqual(100);
    expect(read('AGENTS.md')).toContain('docs/reference/evidence.md');
    expect(read('AGENTS.md')).toContain('docs/reference/testing-strategy.md');
  });

  it('keeps agent-facing canonical docs discoverable from AGENTS.md', () => {
    const agents = read('AGENTS.md');
    const canonicalDocs = [
      'docs/core/architecture.md',
      'docs/core/context.md',
      'docs/core/principles.md',
      'docs/core/agent-engineering.md',
      'docs/core/markdown-engineering.md',
      'docs/reference/evidence.md',
      'docs/reference/testing-strategy.md',
      'docs/reference/review-standards.md',
      'docs/workflows/grill-to-ship.md',
    ];

    for (const path of canonicalDocs) {
      expect(existsSync(join(ROOT, path))).toBe(true);
      expect(agents).toContain(path);
    }
  });

  it('keeps the engineering workflow TDD-first for behaviour changes', () => {
    const workflow = read('docs/workflows/grill-to-ship.md');
    expect(workflow).toContain('write the failing test');
    expect(workflow).toContain('make the smallest change');
    expect(workflow).toContain('run the focused test');
    expect(workflow).toContain('refactor only after green');
  });

  it('keeps the agent loop explicit and measurable', () => {
    const agentEngineering = read('docs/core/agent-engineering.md');
    const markdownEngineering = read('docs/core/markdown-engineering.md');
    expect(agentEngineering).toContain('acceptance signal');
    expect(agentEngineering).toContain('bounded change surface');
    expect(markdownEngineering).toContain('feedback loop');
    expect(markdownEngineering).toContain('keep or revert');
    expect(markdownEngineering).toContain('autoresearch');
    expect(markdownEngineering).toContain('Harness Engineering');
  });

  it('keeps project context and agent instructions separate', () => {
    const context = read('CONTEXT.md');
    const agentEngineering = read('docs/core/agent-engineering.md');
    expect(context).toContain('Project vocabulary');
    expect(context).not.toContain('TDD');
    expect(agentEngineering).toContain('TDD');
    expect(agentEngineering).toContain('bounded change surface');
  });
});
