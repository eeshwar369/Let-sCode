import {
  ExecutionResult,
  Submission,
  SubmissionRequest,
  SupportedLanguage,
  SystemMetrics,
} from '@letscode/shared';
import { v4 as uuidv4 } from 'uuid';
import { StrategyRouter } from './strategy-router';
import { ContainerOrchestrator } from './server/container-orchestrator';
import { JudgeEngine } from '../judge/judge-engine';
import { SubmissionRepository } from '../database/submission-repository';
import { SubmissionQueue } from '../queue/submission-queue';

export class ExecutionController {
  private router: StrategyRouter;
  private orchestrator: ContainerOrchestrator;
  private judge: JudgeEngine;
  private repository: SubmissionRepository;
  private queue: SubmissionQueue;

  constructor(
    repository: SubmissionRepository,
    queue: SubmissionQueue
  ) {
    this.router = new StrategyRouter();
    this.orchestrator = new ContainerOrchestrator();
    this.judge = new JudgeEngine();
    this.repository = repository;
    this.queue = queue;
  }

  async submit(request: SubmissionRequest): Promise<string> {
    if (!request.code || request.code.trim().length === 0) {
      throw new Error('Code cannot be empty');
    }

    const submissionId = uuidv4();

    const analysis = this.router.analyzeCode(request.code, request.language);
    const systemMetrics: SystemMetrics = {
      serverLoad: 0.5,
      queueDepth: await this.queue.getQueueDepth(),
      availableWorkers: 10,
      avgResponseTime: 1000,
    };

    const strategy = this.router.selectStrategy(analysis, systemMetrics);

    const submission: Submission = {
      id: submissionId,
      userId: request.userId,
      problemId: request.problemId,
      code: request.code,
      language: request.language,
      status: 'Queued',
      createdAt: new Date(),
      executionStrategy: strategy,
      testResults: [],
    };

    await this.repository.create(submission);
    await this.queue.enqueue(submission);

    console.log(`Submission ${submissionId} queued with strategy: ${strategy.type}`);

    return submissionId;
  }

  async runCustomTest(
    code: string,
    input: string,
    language: SupportedLanguage
  ): Promise<ExecutionResult> {
    const env = await this.orchestrator.createExecutionEnvironment(language);

    try {
      const result = await this.orchestrator.executeInContainer(
        env,
        code,
        input,
        {
          timeLimit: 5000,
          memoryLimit: 512 * 1024 * 1024,
          cpuQuota: 50000,
          pidsLimit: 50,
        }
      );

      return result;
    } finally {
      await this.orchestrator.destroyEnvironment(env);
    }
  }

  async getSubmission(id: string): Promise<Submission | null> {
    return this.repository.findById(id);
  }

  async processSubmission(submission: Submission): Promise<void> {
    submission.status = 'Running';
    submission.startedAt = new Date();
    await this.repository.update(submission);

    const env = await this.orchestrator.createExecutionEnvironment(submission.language);

    try {
      const testCases = [
        {
          id: '1',
          input: '5',
          expectedOutput: '120',
          timeLimit: 1000,
          memoryLimit: 256 * 1024 * 1024,
          isHidden: false,
        },
      ];

      const verdict = await this.judge.evaluate(
        submission.code,
        testCases,
        async (input) => {
          return this.orchestrator.executeInContainer(env, submission.code, input, {
            timeLimit: 5000,
            memoryLimit: 512 * 1024 * 1024,
            cpuQuota: 50000,
            pidsLimit: 50,
          });
        }
      );

      submission.verdict = verdict;
      submission.status = 'Completed';
      submission.completedAt = new Date();
      await this.repository.update(submission);
    } catch (error) {
      submission.status = 'Failed';
      submission.completedAt = new Date();
      await this.repository.update(submission);
      throw error;
    } finally {
      await this.orchestrator.destroyEnvironment(env);
    }
  }
}
