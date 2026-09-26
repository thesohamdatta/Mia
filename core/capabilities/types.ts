export interface Capability {
  id: string;
  name: string;
  description: string;
  skills: string[];
}

export interface CreateCapabilityInput {
  name: string;
  description: string;
  skills?: string[];
}

export interface Team {
  id: string;
  name: string;
  capabilities: Capability[];
  responsibilities: string[];
}

export interface CreateTeamInput {
  name: string;
  capabilities?: Capability[];
  responsibilities?: string[];
}

function requireName(value: string, kind: 'Capability' | 'Team'): string {
  const name = value.trim();
  if (!name) {
    throw new Error(`${kind} name is required`);
  }
  return name;
}

function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createCapability(input: CreateCapabilityInput): Capability {
  return {
    id: makeId('cap'),
    name: requireName(input.name, 'Capability'),
    description: input.description.trim(),
    skills: [...(input.skills ?? [])],
  };
}

export function createTeam(input: CreateTeamInput): Team {
  return {
    id: makeId('team'),
    name: requireName(input.name, 'Team'),
    capabilities: [...(input.capabilities ?? [])],
    responsibilities: [...(input.responsibilities ?? [])],
  };
}
