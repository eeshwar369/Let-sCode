import express from 'express';
import cors from 'cors';
import { SubmissionRequest } from '@letscode/shared';
import { ExecutionController } from '../execution/execution-controller';

export class ApiServer {
  private app: express.Application;
  private controller: ExecutionController;

  constructor(controller: ExecutionController) {
    this.app = express();
    this.controller = controller;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
  }

  private setupRoutes() {
    this.app.post('/api/submit', async (req, res) => {
      try {
        const request: SubmissionRequest = req.body;

        if (!request.code || request.code.trim().length === 0) {
          return res.status(400).json({ error: 'Code cannot be empty' });
        }

        const submissionId = await this.controller.submit(request);
        res.json({ submissionId });
      } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.get('/api/submission/:id', async (req, res) => {
      try {
        const submission = await this.controller.getSubmission(req.params.id);
        if (!submission) {
          return res.status(404).json({ error: 'Submission not found' });
        }
        res.json(submission);
      } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.post('/api/test', async (req, res) => {
      try {
        const { code, input, language } = req.body;
        const result = await this.controller.runCustomTest(code, input, language);
        res.json(result);
      } catch (error) {
        console.error('Custom test error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  listen(port: number) {
    this.app.listen(port, () => {
      console.log(`API server listening on port ${port}`);
    });
  }
}
