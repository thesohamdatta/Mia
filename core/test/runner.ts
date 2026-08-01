import { executeSkill } from '../skills/executor.js';
import { runPreamble } from '../skills/preamble.js';
import { getSkillRegistry } from '../skills/registry.js';
import type { ExecutionContext, TestAssertion, TestCase, TestResult } from './types.js';

export class TestRunnerImpl {
  private registry = getSkillRegistry();

  async runCase(testCase: TestCase, context: ExecutionContext): Promise<TestResult> {
    const startTime = Date.now();
    const assertions: TestAssertion[] = [];

    try {
      if (testCase.setup) {
        await testCase.setup();
      }

      const skill = this.registry.get(testCase.skill);
      if (!skill) {
        throw new Error(`Skill not found: ${testCase.skill}`);
      }

      await runPreamble(skill.manifest.preambleTier, context);

      const result = await executeSkill(
        skill.executor,
        testCase.input.split(' '),
        context,
        testCase.skill
      );

      if (testCase.expectedError) {
        assertions.push({
          passed: !result.ok && result.error?.includes(testCase.expectedError),
          message: `Expected error containing "${testCase.expectedError}"`,
          expected: testCase.expectedError,
          actual: result.error,
        });
      } else if (testCase.expectedOutput) {
        assertions.push({
          passed: result.output?.includes(testCase.expectedOutput) ?? false,
          message: `Expected output containing "${testCase.expectedOutput}"`,
          expected: testCase.expectedOutput,
          actual: result.output,
        });
      }

      const passed = assertions.every((a) => a.passed);

      return {
        passed,
        duration: Date.now() - startTime,
        output: result.output,
        error: result.error,
        assertions,
      };
    } catch (error) {
      return {
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        assertions: [
          {
            passed: false,
            message: `Test threw: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    } finally {
      if (testCase.teardown) {
        await testCase.teardown();
      }
    }
  }
}

export function createTestRunner(): TestRunnerImpl {
  return new TestRunnerImpl();
}
