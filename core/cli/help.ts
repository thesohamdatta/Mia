import { getSkill } from '../skills/index.js';
import { MIA_VERSION } from '../version.js';

const BUILTIN_LINES: readonly string[] = [
  '  help        Show this help message',
  '  version     Show MIA version',
];
const CORE_SKILLS: readonly string[] = [
  'grill',
  'plan',
  'spec',
  'ship',
  'review',
  'health',
  'setup',
];
const LEARNING_SKILLS: readonly string[] = ['learn', 'retro', 'memory', 'checkpoint'];
const TOOLING_SKILLS: readonly string[] = ['vc'];

function registryLine(name: string): string | undefined {
  const definition = getSkill(name);
  return definition ? `  ${name.padEnd(12)}${definition.manifest.description}` : undefined;
}

function lines(names: readonly string[]): string[] {
  return names.map(registryLine).filter((line): line is string => line !== undefined);
}

export function formatHelp(): string {
  return `MIA (Machine Intelligence Architecture) CLI
Version: ${MIA_VERSION}

Usage: mia <skill> [args...]

Core skills:
${[...BUILTIN_LINES, ...lines(CORE_SKILLS)].join('\n')}

Learning skills:
${lines(LEARNING_SKILLS).join('\n')}

Tooling:
${lines(TOOLING_SKILLS).join('\n')}

Run 'mia <skill> --help' for skill-specific usage.

~ maximum value per line ~`;
}
