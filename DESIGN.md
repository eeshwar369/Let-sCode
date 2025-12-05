# Let'sCode Execution Engine - Design Document

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Execution Strategies](#execution-strategies)
4. [Security Design](#security-design)
5. [Scalability](#scalability)
6. [API Reference](#api-reference)
7. [Innovation & Creative Approaches](#innovation--creative-approaches)
8. [Implementation Details](#implementation-details)

---

## System Overview

### Purpose

Let'sCode is a code execution platform that safely runs user-submitted code in multiple programming languages. It's designed for competitive programming, coding challenges, and educational platforms.

### Design Goals

1. **Security First**: Prevent malicious code from harming the system
2. **Performance**: Provide fast execution with minimal latency
3. **Scalability**: Handle thousands of concurrent submissions
4. **Cost Efficiency**: Minimize infrastructure costs
5. **User Experience**: Provide instant feedback and real-time updates

### Supported Languages

- JavaScript (Node.js 20)
- Python (3.11)
- C++ (GCC 13)
- Rust (1.75)

---

## Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  Monaco    │  │  Submission  │  │   WebSocket      │    │
│  │  Editor    │  │  Controller  │  │   Client         │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  Express   │  │  WebSocket   │  │   Strategy       │    │
│  │  Server    │  │  Server      │  │   Router         │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                   Execution Layer                            │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  Client    │  │   Server     │  │    Hybrid        │    │
│  │  Executor  │  │   Executor   │  │    Executor      │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    Judge Engine                              │
│         (Evaluates output against test cases)                │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  Data Storage                                │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │PostgreSQL  │  │    Redis     │  │   InfluxDB       │    │
│  │(Submissions)│  │   (Queue)    │  │   (Metrics)      │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Component Descriptions

#### Frontend Components

**Monaco Editor**
- Professional code editor (same as VS Code)
- Syntax highlighting for all supported languages
- Auto-completion and error detection
- Responsive layout

**Submission Controller**
- Handles code submission
- Manages WebSocket connections
- Displays real-time execution status
- Shows test results and verdicts

#### Backend Components

**API Server (Express)**
- REST API endpoints for submissions
- Request validation
- Authentication (future)
- Rate limiting

**WebSocket Server**
- Real-time status updates
- Test case result streaming
- System status broadcasting
- Per-user connection management

**Strategy Router**
- Analyzes submitted code
- Detects unsafe operations
- Estimates resource requirements
- Selects optimal execution strategy

**Execution Engines**
- Client-side: Web Worker executor
- Server-side: Docker container orchestrator
- Hybrid: Combines both approaches

**Judge Engine**
- Runs code against test cases
- Compares output with expected results
- Generates verdicts (Accepted, Wrong Answer, etc.)
- Tracks execution metrics

#### Data Storage

**PostgreSQL**
- Stores submissions
- Stores problems and test cases
- Stores user data
- Stores execution history

**Redis**
- Submission queue
- Queue position tracking
- Caching frequently accessed data

**InfluxDB**
- Execution metrics
- System performance data
- Security violation logs

---

## Execution Strategies

### 1. Client-Side Execution

**When Used:**
- JavaScript code without unsafe operations
- Simple algorithms
- Low resource requirements
- No file I/O or network access needed

**How It Works:**

```javascript
// 1. Create isolated Web Worker
const worker = new Worker(workerScript);

// 2. Inject sandboxed code
const sandboxedCode = `
  // Block dangerous APIs
  self.fetch = undefined;
  self.XMLHttpRequest = undefined;
  self.WebSocket = undefined;
  
  // User code
  ${userCode}
`;

// 3. Execute with timeout
const timeout = setTimeout(() => {
  worker.terminate();
  reject('Time Limit Exceeded');
}, 5000);

// 4. Collect results
worker.onmessage = (result) => {
  clearTimeout(timeout);
  resolve(result);
};
```

**Advantages:**
- Zero server cost
- Instant execution (<100ms)
- Infinite scalability
- No infrastructure management

**Limitations:**
- JavaScript only (Python via Pyodide possible)
- No file system access
- No network access
- Limited memory

### 2. Server-Side Execution

**When Used:**
- Code with file I/O or network operations
- Compiled languages (C++, Rust)
- Complex algorithms
- High resource requirements

**How It Works:**

```javascript
// 1. Create isolated Docker container
const container = await docker.createContainer({
  Image: 'letscode-python:minimal',
  HostConfig: {
    Memory: 512 * 1024 * 1024,      // 512MB
    CpuQuota: 50000,                 // 50% CPU
    PidsLimit: 50,                   // Max 50 processes
    NetworkMode: 'none',             // No network
    ReadonlyRootfs: true,            // Read-only filesystem
    SecurityOpt: ['no-new-privileges']
  }
});

// 2. Start container
await container.start();

// 3. Write code and input
await writeToContainer(container, '/workspace/code.py', code);
await writeToContainer(container, '/workspace/input.txt', input);

// 4. Execute with monitoring
const result = await executeWithTimeout(container, 5000);

// 5. Cleanup
await container.stop();
await container.remove();
```

**Advantages:**
- Full language support
- Complete isolation
- Precise resource control
- Advanced security

**Limitations:**
- Higher latency (~2s)
- Infrastructure costs
- Requires container management

### 3. Hybrid Execution

**When Used:**
- Medium complexity code
- Frequently used languages
- High system load

**How It Works:**

```javascript
function selectStrategy(code, language, systemLoad) {
  // Analyze code
  const analysis = analyzeCode(code, language);
  
  // Decision logic
  if (analysis.isSafe && analysis.isSimple) {
    return 'client';  // Fast, free
  }
  
  if (analysis.hasUnsafeOps || analysis.isComplex) {
    return 'server';  // Secure, powerful
  }
  
  if (systemLoad > 0.8 && analysis.isSafe) {
    return 'client';  // Offload to browser
  }
  
  return 'server';  // Default to secure
}
```

**Code Analysis:**
- Detects file I/O: `fs.`, `open(`, `fopen`
- Detects network: `fetch`, `socket`, `http.`
- Detects processes: `exec`, `spawn`, `fork`
- Estimates complexity: loop count, recursion depth
- Estimates resources: memory allocations, CPU usage

---

## Security Design

### Defense in Depth (6 Layers)

#### Layer 1: Application-Level Restrictions

**Client-Side:**
```javascript
// Block dangerous APIs
self.importScripts = undefined;
self.fetch = undefined;
self.XMLHttpRequest = undefined;
self.WebSocket = undefined;
self.indexedDB = undefined;
```

**Purpose:** First line of defense in browser execution

#### Layer 2: Linux Namespaces

**PID Namespace:**
- Container sees only its own processes
- Cannot see or signal host processes
- Process ID 1 inside container ≠ PID 1 on host

**Network Namespace:**
- No network interfaces (except loopback)
- Cannot make outbound connections
- Prevents data exfiltration

**Mount Namespace:**
- Isolated filesystem view
- Cannot see host mounts
- Prevents filesystem traversal

**IPC Namespace:**
- Isolated shared memory
- Isolated message queues
- Cannot access host IPC

**UTS Namespace:**
- Isolated hostname
- Cannot affect host identity

**User Namespace:**
- Root in container = unprivileged on host
- Prevents privilege escalation

#### Layer 3: Cgroups (Resource Limits)

```yaml
Memory:
  Hard Limit: 512MB
  Soft Limit: 256MB
  Swap: Disabled
  OOM Killer: Enabled

CPU:
  Quota: 50000 (50% of one core)
  Period: 100000
  Shares: 1024

PIDs:
  Max: 50 (prevents fork bombs)

I/O:
  Read: 10MB/s
  Write: 10MB/s
```

#### Layer 4: Seccomp-BPF (Syscall Filtering)

**Whitelist Approach:**
```json
{
  "defaultAction": "SCMP_ACT_KILL",
  "syscalls": [
    {
      "names": ["read", "write", "close", "mmap", "brk"],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

**Blocked Syscalls:**
- `socket`, `connect`, `bind` - Network operations
- `fork`, `clone`, `vfork` - Process creation
- `ptrace` - Process debugging
- `mount`, `umount` - Filesystem operations
- `reboot` - System operations

#### Layer 5: Filesystem Restrictions

```yaml
Root Filesystem: Read-only
Workspace: /workspace (read-write, 100MB limit)
Temp: /tmp (read-write, temporary)
```

**Prevented:**
- Cannot modify system files
- Cannot install packages
- Cannot create persistent files
- Cannot access other users' files

#### Layer 6: Network Isolation

```yaml
NetworkMode: none
```

**Result:**
- No HTTP requests
- No database connections
- No email sending
- No data exfiltration

### Security Monitoring

**Real-Time Detection:**
```javascript
// Monitor syscall rate
if (syscallsPerSecond > 10000) {
  terminateExecution();
  logViolation('Excessive syscall rate');
}

// Monitor memory growth
if (memoryGrowthRate > 100MB/sec) {
  terminateExecution();
  logViolation('Rapid memory allocation');
}
```

**Audit Logging:**
- All security violations logged
- 30-day retention
- User account flagging after 5 violations/hour
- Forensic evidence preservation

---

## Scalability

### Auto-Scaling

**Worker Pool Management:**
```javascript
// Scale up when queue is deep
if (queueDepth > 10) {
  await provisionWorkers(Math.ceil(queueDepth / 5));
}

// Scale down when idle
if (idleWorkers > 5 && idleTime > 5 * 60 * 1000) {
  await terminateIdleWorkers();
}
```

**Metrics:**
- Queue depth monitoring
- Worker utilization tracking
- Response time measurement
- Throughput calculation

### Container Pooling

**Warm Pool:**
```javascript
// Keep containers warm for reuse
const warmPool = new Map();

async function getContainer(language) {
  // Try to get from warm pool
  if (warmPool.has(language)) {
    const container = warmPool.get(language);
    if (container.isIdle()) {
      return container;
    }
  }
  
  // Create new if needed
  return await createContainer(language);
}

// Return to pool after use
async function releaseContainer(container) {
  container.markIdle();
  warmPool.set(container.language, container);
  
  // Cleanup after 5 minutes
  setTimeout(() => {
    if (container.isIdle()) {
      container.destroy();
    }
  }, 5 * 60 * 1000);
}
```

### Caching

**Multi-Level Cache:**
1. **In-Memory**: Active problems and test cases
2. **Redis**: Frequently accessed data
3. **Database**: Source of truth

---

## API Reference

### REST API

#### POST /api/submit

Submit code for execution.

**Request:**
```json
{
  "code": "print(int(input()) * 2)",
  "language": "python",
  "problemId": "problem-1",
  "userId": "user-123",
  "isCustomTest": false
}
```

**Response:**
```json
{
  "submissionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### GET /api/submission/:id

Get submission status and results.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "Completed",
  "verdict": {
    "status": "Accepted",
    "passedTests": 5,
    "totalTests": 5,
    "maxTime": 45,
    "maxMemory": 12582912
  },
  "testResults": [
    {
      "testCaseNumber": 1,
      "passed": true,
      "verdict": "Accepted",
      "executionTime": 45,
      "memoryUsed": 12582912
    }
  ]
}
```

#### POST /api/test

Run custom test without saving.

**Request:**
```json
{
  "code": "console.log('Hello')",
  "input": "",
  "language": "javascript"
}
```

**Response:**
```json
{
  "success": true,
  "output": "Hello\n",
  "executionTime": 123,
  "memoryUsed": 8388608
}
```

### WebSocket API

#### Connection

```javascript
const ws = new WebSocket('ws://localhost:3001?userId=user-123');
```

#### Status Update Message

```json
{
  "type": "status_update",
  "data": {
    "submissionId": "uuid",
    "status": "Running",
    "currentTest": 2,
    "testResult": {
      "testCaseNumber": 2,
      "passed": true,
      "verdict": "Accepted"
    }
  }
}
```

---

## Innovation & Creative Approaches

### 1. Proxy-Based Memory Tracking

**Problem:** Web Workers don't have native memory tracking APIs.

**Solution:** Use JavaScript Proxies to intercept allocations:

```javascript
const originalArray = Array;
Array = new Proxy(originalArray, {
  construct(target, args) {
    const size = args[0] || 0;
    allocatedMemory += size * 8;  // Rough estimate
    
    if (allocatedMemory > maxMemory) {
      throw new Error('Memory Limit Exceeded');
    }
    
    return new target(...args);
  }
});
```

**Benefits:**
- No native API needed
- Works in all browsers
- Extensible to other types

### 2. Language-Specific Seccomp Profiles

**Problem:** Different languages need different system calls.

**Solution:** Create tailored syscall whitelists:

```javascript
const profiles = {
  javascript: ['futex', 'set_robust_list', 'epoll_wait'],
  python: ['openat', 'stat', 'getcwd', 'getdents'],
  cpp: ['execve', 'access', 'arch_prctl']
};
```

**Benefits:**
- Tighter security (minimal attack surface)
- Better performance (fewer blocked calls)
- Language-optimized

### 3. Intelligent Code Analysis

**Problem:** How to decide between client and server execution?

**Solution:** Static code analysis:

```javascript
function analyzeCode(code, language) {
  return {
    hasFileIO: /fs\.|open\(|fopen/.test(code),
    hasNetwork: /fetch|socket|http\./.test(code),
    hasProcesses: /exec|spawn|fork/.test(code),
    loopCount: (code.match(/\b(for|while)\b/g) || []).length,
    complexity: estimateComplexity(code)
  };
}
```

### 4. Speculative Execution

**Problem:** Container startup adds latency.

**Solution:** Pre-warm containers based on user behavior:

```javascript
// Predict next language
const prediction = await predictLanguage(userId);

// Pre-warm if confident
if (prediction.confidence > 0.7) {
  await prewarmContainer(prediction.language);
}
```

---

## Implementation Details

### Technology Choices

**Why Node.js?**
- Excellent async I/O for handling many connections
- Rich ecosystem (Docker SDK, WebSocket libraries)
- TypeScript support for type safety
- Same language as frontend (code sharing)

**Why Docker?**
- Industry-standard containerization
- Fine-grained control over isolation
- Extensive API for management
- Wide language support

**Why PostgreSQL?**
- ACID compliance for submissions
- JSON support for flexible data
- Excellent performance
- Mature and reliable

**Why Redis?**
- Fast queue operations
- Pub/sub for real-time updates
- Simple data structures
- High throughput

### Performance Optimizations

**Container Reuse:**
- Keep containers warm for 5 minutes
- Reuse for same language
- Reduces startup latency from 2s to <100ms

**Batch Processing:**
- Run multiple test cases in one container
- Amortize startup costs
- Reduces total execution time

**Caching:**
- Cache compiled code
- Cache test cases in memory
- Cache warm containers

### Deployment

**Development:**
```bash
docker-compose up -d
npm run dev
```

**Production:**
- Load balancer (nginx)
- Multiple API servers (stateless)
- WebSocket servers (sticky sessions)
- Worker pool (auto-scaling)
- Database replicas (read scaling)

---

## Conclusion

Let'sCode demonstrates a complete code execution platform with:

- **Security**: 6-layer defense in depth
- **Performance**: <500ms client-side, <2s server-side
- **Scalability**: Auto-scaling to handle thousands of submissions
- **Innovation**: Novel approaches to execution and security
- **Quality**: Production-ready code with comprehensive documentation

The system balances security, performance, and cost while providing an excellent user experience.
