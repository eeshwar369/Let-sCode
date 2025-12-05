// Core Types for Let'sCode Execution Engine

export type SupportedLanguage = 'javascript' | 'python' | 'cpp' | 'rust';

export type SubmissionStatus = 'Queued' | 'Running' | 'Judging' | 'Completed' | 'Failed' | 'Cancelled';

export type VerdictStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Runtime Error'
  | 'Compilation Error'
  | 'Security Violation'
  | 'System Error';

export type ExecutionStrategyType = 'client' | 'server' | 'hybrid';

export type ExecutionEnvironmentType = 'worker' | 'container' | 'wasm';

export type ComparisonMode = {
  trimWhitespace: boolean;
  ignoreTrailingSpaces: boolean;
  ignoreEmptyLines: boolean;
};

// Submission Models
export interface SubmissionRequest {
  code: string;
  language: SupportedLanguage;
  problemId: string;
  userId: string;
  isCustomTest: boolean;
  customInput?: string;
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  code: string;
  language: SupportedLanguage;
  status: SubmissionStatus;
  verdict?: Verdict;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  executionStrategy: ExecutionStrategy;
  testResults: TestCaseResult[];
}

// Execution Strategy
export interface ExecutionStrategy {
  type: ExecutionStrategyType;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
}

export interface CodeAnalysis {
  complexity: 'low' | 'medium' | 'high';
  hasUnsafeOperations: boolean;
  estimatedMemory: number;
  estimatedCPU: number;
  requiresCompilation: boolean;
  canRunInBrowser: boolean;
}

// Resource Limits
export interface ResourceLimits {
  timeLimit: number; // milliseconds
  memoryLimit: number; // bytes
  cpuQuota: number;
  pidsLimit: number;
}

// Execution Results
export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  verdict?: VerdictStatus;
  executionTime?: number;
  memoryUsed?: number;
  exitCode?: number;
}

// Test Cases
export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  timeLimit: number;
  memoryLimit: number;
  isHidden: boolean;
}

export interface TestCaseResult {
  testCaseNumber: number;
  passed: boolean;
  verdict: VerdictStatus;
  executionTime: number;
  memoryUsed: number;
  actualOutput?: string;
  error?: string;
}

// Verdict
export interface Verdict {
  status: VerdictStatus;
  passedTests: number;
  totalTests: number;
  maxTime: number;
  maxMemory: number;
  failedTestCase?: number;
  errorMessage?: string;
}

// Problem Model
export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
  memoryLimit: number;
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
  comparisonMode: ComparisonMode;
  supportedLanguages: SupportedLanguage[];
}

// Execution Environment
export interface ExecutionEnvironment {
  id: string;
  type: ExecutionEnvironmentType;
  language: SupportedLanguage;
  status: 'idle' | 'busy' | 'terminated';
  createdAt: number;
  lastUsed: number;
  executionCount: number;
}

// Resource Metrics
export interface ResourceMetrics {
  submissionId: string;
  cpuTime: number;
  wallTime: number;
  peakMemory: number;
  syscallCount: number;
  contextSwitches: number;
  pageFaults: number;
}

// WebSocket Messages
export interface StatusUpdate {
  submissionId: string;
  status: SubmissionStatus;
  queuePosition?: number;
  currentTest?: number;
  testResult?: TestCaseResult;
  verdict?: Verdict;
}

export interface SystemStatus {
  queueDepth: number;
  activeWorkers: number;
  totalWorkers: number;
  avgExecutionTime: number;
}

// Security
export interface SecurityViolation {
  submissionId: string;
  userId: string;
  violationType: string;
  attemptedAction: string;
  timestamp: Date;
}

// System Metrics
export interface SystemMetrics {
  serverLoad: number;
  queueDepth: number;
  availableWorkers: number;
  avgResponseTime: number;
}
