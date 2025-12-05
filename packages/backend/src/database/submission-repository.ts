import { Pool } from 'pg';
import { Submission } from '@letscode/shared';

export class SubmissionRepository {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async create(submission: Submission): Promise<void> {
    await this.pool.query(
      `INSERT INTO submissions (id, user_id, problem_id, code, language, status, created_at, execution_strategy)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        submission.id,
        submission.userId,
        submission.problemId,
        submission.code,
        submission.language,
        submission.status,
        submission.createdAt,
        JSON.stringify(submission.executionStrategy),
      ]
    );
  }

  async update(submission: Submission): Promise<void> {
    await this.pool.query(
      `UPDATE submissions 
       SET status = $1, verdict = $2, started_at = $3, completed_at = $4, test_results = $5
       WHERE id = $6`,
      [
        submission.status,
        JSON.stringify(submission.verdict),
        submission.startedAt,
        submission.completedAt,
        JSON.stringify(submission.testResults),
        submission.id,
      ]
    );
  }

  async findById(id: string): Promise<Submission | null> {
    const result = await this.pool.query('SELECT * FROM submissions WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      problemId: row.problem_id,
      code: row.code,
      language: row.language,
      status: row.status,
      verdict: row.verdict ? JSON.parse(row.verdict) : undefined,
      createdAt: row.created_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      executionStrategy: JSON.parse(row.execution_strategy),
      testResults: row.test_results ? JSON.parse(row.test_results) : [],
    };
  }

  async findByUserId(userId: string, limit = 50): Promise<Submission[]> {
    const result = await this.pool.query(
      'SELECT * FROM submissions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      problemId: row.problem_id,
      code: row.code,
      language: row.language,
      status: row.status,
      verdict: row.verdict ? JSON.parse(row.verdict) : undefined,
      createdAt: row.created_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      executionStrategy: JSON.parse(row.execution_strategy),
      testResults: row.test_results ? JSON.parse(row.test_results) : [],
    }));
  }

  async initSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        problem_id VARCHAR(255) NOT NULL,
        code TEXT NOT NULL,
        language VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        verdict JSONB,
        created_at TIMESTAMP NOT NULL,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        execution_strategy JSONB NOT NULL,
        test_results JSONB,
        INDEX idx_user_id (user_id),
        INDEX idx_problem_id (problem_id),
        INDEX idx_created_at (created_at)
      )
    `);
  }
}
