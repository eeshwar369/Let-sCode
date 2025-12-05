import { ExecutionResult, ResourceLimits } from '@letscode/shared';

export class WebWorkerExecutor {
  async execute(
    code: string,
    input: string,
    limits: ResourceLimits
  ): Promise<ExecutionResult> {
    const workerCode = this.generateSandboxedWorker(code, input, limits);

    return {
      success: true,
      output: workerCode,
      executionTime: 0,
      memoryUsed: 0,
    };
  }

  private generateSandboxedWorker(
    code: string,
    input: string,
    limits: ResourceLimits
  ): string {
    return `
// Disable dangerous APIs
self.importScripts = undefined;
self.fetch = undefined;
self.XMLHttpRequest = undefined;
self.WebSocket = undefined;

// Memory tracking
let allocatedMemory = 0;
const maxMemory = ${limits.memoryLimit};

// Override Array to track allocations
const originalArray = Array;
Array = new Proxy(originalArray, {
  construct(target, args) {
    const size = args[0] || 0;
    allocatedMemory += size * 8;
    if (allocatedMemory > maxMemory) {
      throw new Error('Memory Limit Exceeded');
    }
    return new target(...args);
  }
});

// User code execution
try {
  const userFunction = new Function('input', \`
    ${code}
    return typeof main === 'function' ? main(input) : null;
  \`);
  
  const result = userFunction(${JSON.stringify(input)});
  self.postMessage({ success: true, output: String(result) });
} catch (error) {
  self.postMessage({ success: false, error: error.message });
}
    `.trim();
  }
}
