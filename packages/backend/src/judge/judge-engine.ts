import {
  ComparisonMode,
  ExecutionResult,
  TestCase,
  TestCaseResult,
  Verdict,
  VerdictStatus,
} from '@letscode/shared';

export class JudgeEngine {
  async evaluate(
    code: string,
    testCases: TestCase[],
    executeFunction: (input: string) => Promise<ExecutionResult>
  ): Promise<Verdict> {
    const results: TestCaseResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const result = await this.runTestCase(testCase, executeFunction, i + 1);
      results.push(result);

      if (!result.passed) {
        break;
      }
    }

    return this.generateVerdict(results, testCases.length);
  }

  private async runTestCase(
    testCase: TestCase,
    executeFunction: (input: string) => Promise<ExecutionResult>,
    testNumber: number
  ): Promise<TestCaseResult> {
    try {
      const result = await executeFunction(testCase.input);

      if (!result.success) {
        return {
          testCaseNumber: testNumber,
          passed: false,
          verdict: (result.verdict as VerdictStatus) || 'Runtime Error',
          executionTime: result.executionTime || 0,
          memoryUsed: result.memoryUsed || 0,
          error: result.error,
        };
      }

      if (result.executionTime && result.executionTime > testCase.timeLimit) {
        return {
          testCaseNumber: testNumber,
          passed: false,
          verdict: 'Time Limit Exceeded',
          executionTime: result.executionTime,
          memoryUsed: result.memoryUsed || 0,
        };
      }

      const outputMatches = this.compareOutput(
        result.output || '',
        testCase.expectedOutput,
        { trimWhitespace: true, ignoreTrailingSpaces: true, ignoreEmptyLines: false }
      );

      return {
        testCaseNumber: testNumber,
        passed: outputMatches,
        verdict: outputMatches ? 'Accepted' : 'Wrong Answer',
        executionTime: result.executionTime || 0,
        memoryUsed: result.memoryUsed || 0,
        actualOutput: result.output,
      };
    } catch (error) {
      return {
        testCaseNumber: testNumber,
        passed: false,
        verdict: 'Runtime Error',
        executionTime: 0,
        memoryUsed: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  compareOutput(actual: string, expected: string, mode: ComparisonMode): boolean {
    const normalizedActual = this.normalize(actual, mode);
    const normalizedExpected = this.normalize(expected, mode);
    return normalizedActual === normalizedExpected;
  }

  private normalize(output: string, mode: ComparisonMode): string {
    let normalized = output;

    if (mode.trimWhitespace) {
      normalized = normalized.trim();
    }

    if (mode.ignoreTrailingSpaces) {
      normalized = normalized
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n');
    }

    if (mode.ignoreEmptyLines) {
      normalized = normalized
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .join('\n');
    }

    return normalized;
  }

  private generateVerdict(results: TestCaseResult[], totalTests: number): Verdict {
    const allPassed = results.every((r) => r.passed);

    if (allPassed) {
      return {
        status: 'Accepted',
        passedTests: results.length,
        totalTests: totalTests,
        maxTime: Math.max(...results.map((r) => r.executionTime)),
        maxMemory: Math.max(...results.map((r) => r.memoryUsed)),
      };
    }

    const firstFailure = results.find((r) => !r.passed);
    return {
      status: firstFailure!.verdict,
      passedTests: results.filter((r) => r.passed).length,
      totalTests: totalTests,
      maxTime: Math.max(...results.map((r) => r.executionTime)),
      maxMemory: Math.max(...results.map((r) => r.memoryUsed)),
      failedTestCase: firstFailure!.testCaseNumber,
      errorMessage: firstFailure!.error,
    };
  }
}
