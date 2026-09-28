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
      'docs/core/principles.md',
      'docs/core/agent-engineering.md',
      'docs/reference/evidence.md',
      'docs/reference/testing-strategy.md',
      'docs/reference/review-standards.md',
      'docs/workflows/',
    ];

    for (const path of canonicalDocs) {
      expect(existsSync(join(ROOT, path))).toBe(true);
      expect(agents).toContain(path);
    }
  });

  it('keeps the engineering workflow adaptive for behaviour changes', () => {
    const workflow = read('docs/workflows/grill-to-ship.md');
    expect(workflow).toContain('Engineering Workflow');
    expect(workflow).toContain('inspect → change → verify');
    expect(workflow).toContain('explore → contract → plan → change → verify → review');
    expect(workflow).toContain('Make the smallest coherent change');
  });

  it('keeps project context and agent instructions separate', () => {
    const context = read('CONTEXT.md');
    const agentEngineering = read('docs/core/agent-engineering.md');
    expect(context).toContain('Core vocabulary');
    expect(context).not.toContain('Agent Engineering');
    expect(agentEngineering).toContain('Agent Engineering');
  });
});
