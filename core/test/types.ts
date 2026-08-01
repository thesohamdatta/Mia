import type { ExecutionContext } from '../skills/types.js';

export interface TestCase {
  name: string;
  description: string;
  skill: string;
  input: string;
  expectedOutput?: string;
  expectedError?: string;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  tags?: string[];
  timeout?: number;
}

export interface TestSuite {
  name: string;
  description: string;
  cases: TestCase[];
}

export interface TestResult {
  passed: boolean;
  duration: number;
  output?: string;
  error?: string;
  assertions: TestAssertion[];
}

export interface TestAssertion {
  passed: boolean;
  message: string;
  expected?: unknown;
  actual?: unknown;
}

export interface TestRunner {
  run(suite: TestSuite): Promise<TestSuiteResult>;
  runCase(testCase: TestCase, context: ExecutionContext): Promise<TestResult>;
}

export interface TestSuiteResult {
  suiteName: string;
  passed: number;
  failed: number;
  duration: number;
  results: TestResult[];
}

export interface StaticAnalyzer {
  analyze(code: string): StaticAnalysisResult;
}

export interface StaticAnalysisResult {
  issues: StaticIssue[];
  score: number;
  metrics: {
    complexity: number;
    maintainability: number;
    lines: number;
  };
}

export interface StaticIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  line: number;
  column: number;
  severity: 'high' | 'medium' | 'low';
}

export interface LLMJudge {
  evaluate(
    input: string,
    output: string,
    expected?: string,
    criteria?: JudgeCriteria
  ): Promise<JudgeResult>;
}

export interface JudgeCriteria {
  accuracy?: boolean;
  completeness?: boolean;
  clarity?: boolean;
  style?: boolean;
  customCriteria?: string[];
}

export interface JudgeResult {
  score: number;
  passed: boolean;
  feedback: string;
  details: Record<string, number>;
}
