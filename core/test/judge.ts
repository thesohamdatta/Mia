import type { JudgeCriteria, JudgeResult, LLMJudge } from './types.js';

export class LLMJudgeImpl implements LLMJudge {
  private defaultCriteria: JudgeCriteria = {
    accuracy: true,
    completeness: true,
    clarity: true,
    style: true,
  };

  async evaluate(
    input: string,
    output: string,
    expected?: string,
    criteria?: JudgeCriteria
  ): Promise<JudgeResult> {
    const activeCriteria = { ...this.defaultCriteria, ...criteria };
    const scores: Record<string, number> = {};
    let totalScore = 0;
    let count = 0;

    // Simple heuristic-based evaluation
    if (activeCriteria.accuracy && expected) {
      const similarity = this.calculateSimilarity(output, expected);
      scores.accuracy = similarity;
      totalScore += similarity;
      count++;
    }

    if (activeCriteria.completeness) {
      const completeness = this.estimateCompleteness(input, output);
      scores.completeness = completeness;
      totalScore += completeness;
      count++;
    }

    if (activeCriteria.clarity) {
      const clarity = this.estimateClarity(output);
      scores.clarity = clarity;
      totalScore += clarity;
      count++;
    }

    if (activeCriteria.style) {
      const style = this.estimateStyle(output);
      scores.style = style;
      totalScore += style;
      count++;
    }

    const finalScore = count > 0 ? totalScore / count : 0;
    const passed = finalScore >= 0.7;

    return {
      score: Math.round(finalScore * 100) / 100,
      passed,
      feedback: this.generateFeedback(scores, passed),
      details: scores,
    };
  }

  private calculateSimilarity(a: string, b: string): number {
    // Simple Jaccard similarity on words
    const wordsA = new Set(
      a
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );
    const wordsB = new Set(
      b
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );
    const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
    const union = new Set([...wordsA, ...wordsB]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private estimateCompleteness(input: string, output: string): number {
    // Heuristic: output should be substantial relative to input
    const ratio = output.length / Math.max(input.length, 1);
    return Math.min(1, ratio / 2); // Expect output ~2x input for completeness
  }

  private estimateClarity(output: string): number {
    // Heuristic: shorter sentences, clear structure
    const sentences = output.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgLength =
      sentences.reduce((sum, s) => sum + s.length, 0) / Math.max(sentences.length, 1);
    return Math.max(0, 1 - (avgLength - 20) / 100); // Prefer ~20 char sentences
  }

  private estimateStyle(output: string): number {
    // Heuristic: consistent formatting, no excessive caps
    const capsRatio = (output.match(/[A-Z]/g) || []).length / Math.max(output.length, 1);
    const hasStructure = /\n|-/.test(output) ? 1 : 0;
    return Math.max(0, 1 - capsRatio * 2) * 0.5 + hasStructure * 0.5;
  }

  private generateFeedback(scores: Record<string, number>, passed: boolean): string {
    const parts = [];
    for (const [key, value] of Object.entries(scores)) {
      parts.push(`${key}: ${Math.round(value * 100)}%`);
    }
    return `${passed ? '✅ PASSED' : '❌ FAILED'} — ${parts.join(', ')}`;
  }
}

export function createLLMJudge(): LLMJudgeImpl {
  return new LLMJudgeImpl();
}
