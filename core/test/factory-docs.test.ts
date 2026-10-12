import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

const FACTORY_DOCS = [
  'docs/core/software-factory.md',
  'docs/reference/agent-readiness.md',
  'docs/reference/factory-metrics.md',
  'docs/workflows/software-factory.md',
  'docs/decisions/ADR-0002-software-factory.md',
];

describe('software factory documentation contract', () => {
  it('ships the factory document set', () => {
    for (const path of FACTORY_DOCS) {
      expect(existsSync(join(ROOT, path))).toBe(true);
    }
  });

  it('keeps the factory concept discoverable from AGENTS.md', () => {
    const agents = read('AGENTS.md');
    expect(agents).toContain('docs/core/software-factory.md');
    expect(agents).toContain('docs/reference/agent-readiness.md');
    expect(agents).toContain('docs/workflows/software-factory.md');
  });

  it('describes the inner, outer, and meta loops in the workflow', () => {
    const workflow = read('docs/workflows/software-factory.md');
    expect(workflow.toLowerCase()).toContain('inner loop');
    expect(workflow.toLowerCase()).toContain('outer loop');
    expect(workflow.toLowerCase()).toContain('meta loop');
    expect(workflow).toContain('signal');
  });

  it('records the factory decision as an accepted ADR', () => {
    const adr = read('docs/decisions/ADR-0002-software-factory.md');
    expect(adr).toContain('## Status');
    expect(adr).toContain('Accepted');
    expect(adr).toContain('## Decision');
    expect(adr).toContain('## Consequences');
  });

  it('defines the factory vocabulary in project context', () => {
    const context = read('CONTEXT.md');
    expect(context).toContain('Software factory');
    expect(context).toContain('Agent readiness');
    expect(context).toContain('Signal');
  });
});
