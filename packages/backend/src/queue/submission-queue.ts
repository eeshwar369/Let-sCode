import Redis from 'ioredis';
import { Submission } from '@letscode/shared';

export class SubmissionQueue {
  private redis: Redis;
  private queueKey = 'submissions:queue';

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async enqueue(submission: Submission): Promise<number> {
    await this.redis.rpush(this.queueKey, JSON.stringify(submission));
    return this.getQueueDepth();
  }

  async dequeue(): Promise<Submission | null> {
    const data = await this.redis.lpop(this.queueKey);
    if (!data) return null;
    return JSON.parse(data);
  }

  async getQueueDepth(): Promise<number> {
    return this.redis.llen(this.queueKey);
  }

  async getQueuePosition(submissionId: string): Promise<number> {
    const queue = await this.redis.lrange(this.queueKey, 0, -1);
    const position = queue.findIndex((item) => {
      const submission = JSON.parse(item);
      return submission.id === submissionId;
    });
    return position === -1 ? -1 : position + 1;
  }

  async clear(): Promise<void> {
    await this.redis.del(this.queueKey);
  }
}
