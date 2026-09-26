import { describe, expect, it } from 'bun:test';
import {
  createCapability,
  createTeam,
  type Capability,
  type Team,
} from '../capabilities/types.js';

describe('MIA capability and team contracts', () => {
  const research: Capability = createCapability({
    name: 'research',
    description: 'Investigate unknowns and produce evidence-backed findings',
    skills: ['plan', 'review'],
  });

  const team: Team = createTeam({
    name: 'product',
    capabilities: [research],
    responsibilities: ['Reduce uncertainty before implementation'],
  });

  it('creates a bounded capability with stable identity', () => {
    expect(research.id).toMatch(/^cap_/);
    expect(research.name).toBe('research');
    expect(research.description).toContain('evidence-backed');
    expect(research.skills).toEqual(['plan', 'review']);
  });

  it('creates a team as a composition of capabilities', () => {
    expect(team.id).toMatch(/^team_/);
    expect(team.name).toBe('product');
    expect(team.capabilities).toEqual([research]);
    expect(team.responsibilities).toEqual([
      'Reduce uncertainty before implementation',
    ]);
  });

  it('rejects blank capability and team names', () => {
    expect(() =>
      createCapability({
        name: ' ',
        description: 'Research',
      })
    ).toThrow(/Capability name is required/);

    expect(() =>
      createTeam({
        name: ' ',
        capabilities: [research],
      })
    ).toThrow(/Team name is required/);
  });

  it('copies inputs so callers cannot mutate the created contract indirectly', () => {
    const skills = ['plan'];
    const responsibilities = ['Plan'];
    const capabilities = [research];

    const capability = createCapability({
      name: 'planner',
      description: 'Plan work',
      skills,
    });
    const composedTeam = createTeam({
      name: 'engineering',
      capabilities,
      responsibilities,
    });

    skills.push('review');
    responsibilities.push('Ship');
    capabilities.length = 0;

    expect(capability.skills).toEqual(['plan']);
    expect(composedTeam.responsibilities).toEqual(['Plan']);
    expect(composedTeam.capabilities).toEqual([research]);
  });
});
