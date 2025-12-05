import {
  CodeAnalysis,
  ExecutionStrategy,
  SupportedLanguage,
  SystemMetrics,
} from '@letscode/shared';

export class StrategyRouter {
  analyzeCode(code: string, language: SupportedLanguage): CodeAnalysis {
    const hasFileIO = /fs\.|open\(|readFile|writeFile|fopen|fwrite/i.test(code);
    const hasNetwork = /fetch\(|XMLHttpRequest|WebSocket|socket|http\.|requests\./i.test(code);
    const hasProcessSpawn = /exec\(|spawn\(|fork\(|subprocess|system\(/i.test(code);
    const hasNativeImports = /require\(['"]child_process|import.*child_process/i.test(code);

    const hasUnsafeOperations = hasFileIO || hasNetwork || hasProcessSpawn || hasNativeImports;

    // Estimate complexity
    const loopCount = (code.match(/\b(for|while|do)\b/g) || []).length;
    const recursionIndicators = (code.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*\1/g) || [])
      .length;
    const complexity =
      loopCount > 5 || recursionIndicators > 2
        ? 'high'
        : loopCount > 2
        ? 'medium'
        : ('low' as const);

    // Estimate resources
    const estimatedMemory = code.length * 100 + loopCount * 1024 * 1024; // Rough estimate
    const estimatedCPU = loopCount * 100 + recursionIndicators * 200;

    const requiresCompilation = language === 'cpp' || language === 'rust';
    const canRunInBrowser =
      (language === 'javascript' || language === 'python') && !hasUnsafeOperations;

    return {
      complexity,
      hasUnsafeOperations,
      estimatedMemory,
      estimatedCPU,
      requiresCompilation,
      canRunInBrowser,
    };
  }

  selectStrategy(analysis: CodeAnalysis, systemLoad: SystemMetrics): ExecutionStrategy {
    // Client-side execution for safe, simple code
    if (
      analysis.canRunInBrowser &&
      !analysis.hasUnsafeOperations &&
      analysis.complexity === 'low' &&
      analysis.estimatedMemory < 100 * 1024 * 1024
    ) {
      return {
        type: 'client',
        reason: 'Safe, simple code suitable for browser execution',
        estimatedCost: 0,
        estimatedLatency: 100,
      };
    }

    // Prefer client-side when server is overloaded
    if (
      analysis.canRunInBrowser &&
      !analysis.hasUnsafeOperations &&
      systemLoad.serverLoad > 0.8
    ) {
      return {
        type: 'client',
        reason: 'Server overloaded, routing to client-side',
        estimatedCost: 0,
        estimatedLatency: 200,
      };
    }

    // Server-side for complex or unsafe code
    if (analysis.hasUnsafeOperations || analysis.complexity === 'high') {
      return {
        type: 'server',
        reason: 'Complex or unsafe code requires server-side isolation',
        estimatedCost: 0.001,
        estimatedLatency: 2000,
      };
    }

    // Hybrid with pre-warming for medium complexity
    if (analysis.complexity === 'medium') {
      return {
        type: 'hybrid',
        reason: 'Medium complexity, using pre-warmed containers',
        estimatedCost: 0.0005,
        estimatedLatency: 1000,
      };
    }

    // Default to server-side
    return {
      type: 'server',
      reason: 'Default server-side execution',
      estimatedCost: 0.001,
      estimatedLatency: 2000,
    };
  }
}
