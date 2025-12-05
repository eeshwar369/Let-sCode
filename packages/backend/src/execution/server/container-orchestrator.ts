import Docker from 'dockerode';
import {
  ExecutionEnvironment,
  ExecutionResult,
  ResourceLimits,
  SupportedLanguage,
} from '@letscode/shared';
import { v4 as uuidv4 } from 'uuid';

export class ContainerOrchestrator {
  private docker: Docker;
  private workerPool: Map<string, ExecutionEnvironment>;

  constructor() {
    this.docker = new Docker();
    this.workerPool = new Map();
  }

  async createExecutionEnvironment(language: SupportedLanguage): Promise<ExecutionEnvironment> {
    const containerId = uuidv4();

    const container = await this.docker.createContainer({
      Image: `letscode-${language}:minimal`,
      HostConfig: {
        Memory: 512 * 1024 * 1024,
        MemorySwap: 512 * 1024 * 1024,
        CpuQuota: 50000,
        CpuPeriod: 100000,
        PidsLimit: 50,
        NetworkMode: 'none',
        ReadonlyRootfs: true,
        SecurityOpt: ['no-new-privileges'],
        CapDrop: ['ALL'],
        CapAdd: ['SETUID', 'SETGID'],
      },
      Volumes: {
        '/workspace': {},
      },
    });

    await container.start();

    const env: ExecutionEnvironment = {
      id: containerId,
      type: 'container',
      language,
      status: 'idle',
      createdAt: Date.now(),
      lastUsed: Date.now(),
      executionCount: 0,
    };

    this.workerPool.set(containerId, env);
    return env;
  }

  async executeInContainer(
    env: ExecutionEnvironment,
    code: string,
    input: string,
    limits: ResourceLimits
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      const container = this.docker.getContainer(env.id);

      // Write code and input to container
      await this.writeToContainer(container, '/workspace/solution', code);
      await this.writeToContainer(container, '/workspace/input.txt', input);

      // Execute with monitoring
      const exec = await container.exec({
        Cmd: this.getExecutionCommand(env.language),
        AttachStdout: true,
        AttachStderr: true,
        WorkingDir: '/workspace',
        User: 'nobody',
      });

      const stream = await exec.start({ hijack: true, stdin: false });

      const output = await this.collectOutput(stream, limits.timeLimit);

      return {
        success: true,
        output: output.stdout,
        error: output.stderr,
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
        exitCode: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        verdict: 'Runtime Error',
        executionTime: Date.now() - startTime,
      };
    }
  }

  async destroyEnvironment(env: ExecutionEnvironment): Promise<void> {
    try {
      const container = this.docker.getContainer(env.id);
      await container.stop({ t: 1 });
      await container.remove();
      this.workerPool.delete(env.id);
    } catch (error) {
      console.error(`Failed to destroy environment ${env.id}:`, error);
    }
  }

  private async writeToContainer(
    container: Docker.Container,
    path: string,
    content: string
  ): Promise<void> {
    const exec = await container.exec({
      Cmd: ['sh', '-c', `echo '${content.replace(/'/g, "'\\''")}' > ${path}`],
      AttachStdout: false,
      AttachStderr: false,
    });
    await exec.start({ hijack: false });
  }

  private getExecutionCommand(language: SupportedLanguage): string[] {
    switch (language) {
      case 'javascript':
        return ['node', '/workspace/solution'];
      case 'python':
        return ['python3', '/workspace/solution'];
      case 'cpp':
        return ['sh', '-c', 'g++ /workspace/solution -o /workspace/a.out && /workspace/a.out'];
      case 'rust':
        return ['sh', '-c', 'rustc /workspace/solution -o /workspace/a.out && /workspace/a.out'];
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  private async collectOutput(
    stream: NodeJS.ReadableStream,
    timeout: number
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        reject(new Error('Time Limit Exceeded'));
      }, timeout);

      stream.on('data', (chunk) => {
        const data = chunk.toString();
        if (data.includes('stderr')) {
          stderr += data;
        } else {
          stdout += data;
        }
      });

      stream.on('end', () => {
        clearTimeout(timer);
        resolve({ stdout, stderr });
      });

      stream.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }
}
