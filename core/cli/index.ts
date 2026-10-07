import { createExecutionContext } from '../context.js';
import { executeSkillDefinition } from '../skills/executor.js';
import { getSkill, listSkills } from '../skills/index.js';
import { MIA_VERSION } from '../version.js';
import { formatHelp } from './help.js';

function showHelp(): void {
  console.log(formatHelp());
}

function showVersion(): void {
  console.log(`MIA v${MIA_VERSION} (Machine Intelligence Architecture)`);
  console.log('Built on gstack principles. ~ maximum value per line ~');
}

async function runSkill(skillName: string, args: string[] = []): Promise<void> {
  const definition = getSkill(skillName);

  if (!definition) {
    const available = listSkills().join(', ');
    console.error(`❌ Unknown skill: ${skillName}`);
    console.error(`Available: ${available}`);
    process.exit(1);
  }

  const ctx = createExecutionContext();
  const result = await executeSkillDefinition(definition, args, ctx);

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

if (import.meta.main) {
  main();
}
