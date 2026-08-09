import type { StaticAnalysisResult, StaticAnalyzer, StaticIssue } from './types.js';

export class StaticAnalyzerImpl implements StaticAnalyzer {
  async analyze(code: string): Promise<StaticAnalysisResult> {
    const issues: StaticIssue[] = [];
    let complexity = 0;
    const lines = code.split('\n').length;

    // Basic complexity analysis
    const cyclomaticMatches = code.match(/\b(if|else|for|while|switch|case|catch|&&|\|\|)\b/g);
    complexity = (cyclomaticMatches?.length || 0) + 1;

    // Check for common issues
    if (code.includes('eval(') || code.includes('Function(')) {
      issues.push({
        type: 'error',
        rule: 'no-eval',
        message: 'Use of eval() or Function() constructor is dangerous',
        line: this.findLine(code, 'eval(') || this.findLine(code, 'Function(') || 1,
        column: 0,
        severity: 'high',
      });
    }

    if (code.includes('console.log')) {
      issues.push({
        type: 'warning',
        rule: 'no-console',
        message: 'console.log should be removed in production',
        line: this.findLine(code, 'console.log') || 1,
        column: 0,
        severity: 'low',
      });
    }

    if (code.includes('any')) {
      issues.push({
        type: 'info',
        rule: 'no-any',
        message: 'Avoid using any type',
        line: this.findLine(code, ': any') || 1,
        column: 0,
        severity: 'low',
      });
    }

    // Calculate maintainability score (0-100)
    const maintainability = Math.max(
      0,
      100 -
        complexity * 2 -
        issues.filter((i) => i.severity === 'high').length * 10 -
        issues.filter((i) => i.severity === 'medium').length * 5
    );

    // Overall score (0-10)
    const score = Math.max(0, 10 - complexity * 0.2 - issues.length * 0.5);

    return {
      issues,
      score: Math.round(score * 10) / 10,
      metrics: {
        complexity,
        maintainability: Math.round(maintainability),
        lines,
      },
    };
  }

  private findLine(code: string, search: string): number {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.includes(search)) {
        return i + 1;
      }
    }
    return 1;
  }
}

export function createStaticAnalyzer(): StaticAnalyzerImpl {
  return new StaticAnalyzerImpl();
}
