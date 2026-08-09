import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createExecutionContext } from '../context.js';
import { getSkillExecutor, listSkills } from '../skills/index.js';
import { executeWithMiddlewares } from '../skills/preamble.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function showHelp(): void {
  console.log(`MIA (Machine Intelligence Architecture) CLI
Version: 0.3.0

Usage: mia <skill> [args...]

Core skills:
  help        Show this help message
  version     Show MIA version
  grill       Start a clarification interview (golden rule enforcement)
  plan        Create a verifiable plan with success criteria
  spec        Turn intent into PRD → issues
  ship        Test → review → push → PR
  review      Pre-landing PR review
  health      Code quality dashboard

Learning skills:
  learn       Manage project learnings (list, add)
  retro       Weekly retrospective with timeline + learnings
  memory      Read/write long-term memory (~/.mia/memory.md)
  checkpoint  Save/resume working state

Run 'mia <skill> --help' for skill-specific usage.

~ maximum value per line ~`);
}

function showVersion(): void {
  console.log('MIA v0.3.0 (Machine Intelligence Architecture)');
  console.log('Built on gstack principles. ~ maximum value per line ~');
}

async function runSkill(skillName: string, args: string[] = []): Promise<void> {
  const executor = getSkillExecutor(skillName);

  if (!executor) {
    const available = listSkills().join(', ');
    console.error(`❌ Unknown skill: ${skillName}`);
    console.error(`Available: ${available}`);
    process.exit(1);
  }

  const ctx = createExecutionContext();
  const result = await executeWithMiddlewares(executor, args, ctx, skillName);

  if (!result.ok) {
    console.error(`❌ ${result.error ?? 'Unknown error'}`);
    process.exit(1);
  }

  if (result.output) {
    console.log(result.output);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase() || 'help';
  const cmdArgs = args.slice(1);

  if (command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  if (command === 'version' || command === '--version' || command === '-v') {
    showVersion();
    return;
  }

  try {
    await runSkill(command, cmdArgs);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ ${error.message}`);
    } else {
      console.error(`❌ Unknown error: ${error}`);
    }
    process.exit(1);
  }
}

main();
