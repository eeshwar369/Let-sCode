import dotenv from 'dotenv';
import { ApiServer } from './api/server';
import { ExecutionWebSocketServer } from './websocket/websocket-server';
import { ExecutionController } from './execution/execution-controller';
import { SubmissionRepository } from './database/submission-repository';
import { SubmissionQueue } from './queue/submission-queue';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://letscode:letscode_dev@localhost:5432/letscode';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const API_PORT = parseInt(process.env.API_PORT || '3000');
const WS_PORT = parseInt(process.env.WS_PORT || '3001');

async function main() {
  console.log('Starting Let\'sCode Execution Engine...');

  const repository = new SubmissionRepository(DATABASE_URL);
  await repository.initSchema();
  console.log('Database initialized');

  const queue = new SubmissionQueue(REDIS_URL);
  console.log('Queue initialized');

  const controller = new ExecutionController(repository, queue);
  console.log('Execution controller initialized');

  const apiServer = new ApiServer(controller);
  apiServer.listen(API_PORT);

  const wsServer = new ExecutionWebSocketServer(WS_PORT);
  console.log(`WebSocket server listening on port ${WS_PORT}`);

  console.log('Let\'sCode Execution Engine started successfully!');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
