# Let'sCode Execution Engine - Design Document

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Execution Strategies](#execution-strategies)
4. [Security & Isolation](#security--isolation)
5. [Scalability](#scalability)
6. [Innovation](#innovation)
7. [Trade-offs](#trade-offs)

## Overview

Let'sCode demonstrates technical depth through custom-built execution solutions rather than relying on third-party APIs. The system implements three execution tiers with intelligent routing based on code characteristics and system load.

### Design Goals

1. **Security First**: Multi-layer isolation prevents malicious code from compromising the system
2. **Scalability**: Handle thousands of concurrent submissions through intelligent resource management
3. **Innovation**: Demonstrate novel approaches to code execution, sandboxing, and optimization
4. **Cost Efficiency**: Minimize server costs through client-side execution when safe
5. **User Experience**: Provide instant feedback and real-time status updates

## Architecture

### High-Level Components

\`\`\`
Frontend (React + Monaco)
    ↓
API Server (Express)
    ↓
Execution Strategy Router
    ↓
┌─────────────┬─────────────┬─────────────┐
│  Client     │  Server     │  Hybrid     │
│  Execution  │  Execution  │  Execution  │
└─────────────┴─────────────┴─────────────┘
    ↓
Judge Engine
    ↓
Results Storage (PostgreSQL)
\`\`\`

### Component Responsibilities

#### 1. Strategy Router

**Purpose**: Analyze code and select optimal execution strategy

**Algorithm**:
\`\`\`typescript
function selectStrategy(code, language, systemLoad) {
  const analysis = analyzeCode(code, language);
  
  // Client-side for safe, simple code
  if (analysis.safe && analysis.simple && analysis.browserCompatible) {
    return 'client';
  }
  
  // Prefer client when server is overloaded
  if (analysis.safe && systemLoad > 0.8) {
    return 'client';
  }
  
  // Server-side for complex or unsafe code
  if (analysis.unsafe || analysis.complex) {
    return 'server';
  }
  
  // Hybrid with pre-warming
  return 'hybrid';
}
\`\`\`

**Code Analysis Heuristics**:
- **Unsafe Operations**: File I/O, network calls, process spawning, native imports
- **Complexity**: Loop count, recursion depth, estimated CPU usage
- **Memory**: Code size, allocation patterns, data structure usage
- **Browser Compatibility**: Language support, library dependencies

#### 2. Client-Side Execution

**Web Worker Sandbox**

Advantages:
- Zero server cost
- Instant execution (<100ms)
- Scales infinitely with users
- No infrastructure management

Implementation:
\`\`\`javascript
// Disable dangerous APIs
self.importScripts = undefined;
self.fetch = undefined;
self.XMLHttpRequest = undefined;
self.WebSocket = undefined;

// Memory tracking
const originalArray = Array;
Array = new Proxy(originalArray, {
  construct(target, args) {
    allocatedMemory += args[0] * 8;
    if (allocatedMemory > maxMemory) {
      throw new Error('Memory Limit Exceeded');
    }
    return new target(...args);
  }
});

// Timeout enforcement
setTimeout(() => worker.terminate(), timeLimit);
\`\`\`

**WebAssembly Execution**

For C++/Rust, compile to WASM for browser execution:

Advantages:
- Near-native performance
- Strong sandboxing
- No server resources
- Portable across platforms

Challenges:
- Compilation time overhead
- Limited I/O capabilities
- Browser compatibility

**Pyodide (Python in Browser)**

Advantages:
- Full Python standard library (safe subset)
- No server resources
- Instant feedback

Challenges:
- Large initial download (~10MB)
- Slower than native Python
- Module restrictions

#### 3. Server-Side Execution

**Custom Container Orchestration**

Why not use Kubernetes/ECS/Lambda?
- **Technical Depth**: Demonstrate understanding of containerization
- **Fine-Grained Control**: Custom security policies and resource limits
- **Cost Optimization**: Intelligent pooling and reuse
- **Learning**: Deep dive into Linux isolation primitives

**Container Lifecycle**:
\`\`\`
1. Create container with security constraints
2. Write code and input to container
3. Execute with monitoring
4. Collect output and metrics
5. Destroy container and cleanup
\`\`\`

**Resource Limits**:
\`\`\`yaml
Memory: 512MB hard limit
CPU: 50% of one core
Time: 5 seconds
PIDs: 50 processes max
Network: None (isolated)
Filesystem: Read-only root
\`\`\`

#### 4. Judge Engine

**Test Case Evaluation**:
\`\`\`typescript
async function evaluate(code, testCases) {
  for (const testCase of testCases) {
    const result = await execute(code, testCase.input);
    
    if (result.time > testCase.timeLimit) {
      return 'Time Limit Exceeded';
    }
    
    if (!compareOutput(result.output, testCase.expected)) {
      return 'Wrong Answer';
    }
  }
  
  return 'Accepted';
}
\`\`\`

**Output Comparison**:
- Exact string matching (default)
- Whitespace normalization (configurable)
- Floating-point tolerance (for numerical problems)
- Custom validators (for complex outputs)

## Execution Strategies

### 1. Client-Side Strategy

**When to Use**:
- JavaScript code without unsafe operations
- Python code with Pyodide support
- Simple algorithms (<100 lines)
- Low memory requirements (<100MB)

**Advantages**:
- Zero server cost
- Instant execution
- Infinite scalability
- Reduced server load

**Limitations**:
- Limited to safe operations
- Browser compatibility required
- Memory constraints
- No file I/O or network access

### 2. Server-Side Strategy

**When to Use**:
- Unsafe operations (file I/O, network, processes)
- Complex algorithms (high CPU/memory)
- Compiled languages (C++, Rust)
- Large test cases

**Advantages**:
- Full language support
- No browser limitations
- Precise resource control
- Advanced security isolation

**Limitations**:
- Server costs
- Higher latency (~2s)
- Infrastructure management
- Scaling complexity

### 3. Hybrid Strategy

**When to Use**:
- Medium complexity code
- Frequently used languages
- Predictable user patterns

**Optimization Techniques**:

**Pre-Warming**:
\`\`\`typescript
// Predict user's next submission
const prediction = await predictLanguage(userId);
if (prediction.confidence > 0.7) {
  await prewarmContainer(prediction.language);
}
\`\`\`

**Speculative Execution**:
\`\`\`typescript
// Start compilation before submission
if (userTypingComplete() && codeValid()) {
  await precompile(code, language);
}
\`\`\`

**Container Pooling**:
\`\`\`typescript
// Reuse warm containers
const container = warmPool.get(language) || await createNew();
\`\`\`

## Security & Isolation

### Defense in Depth

Multiple isolation layers ensure security even if one layer fails:

\`\`\`
Layer 1: Application-level restrictions (API blocking)
Layer 2: Process isolation (namespaces)
Layer 3: Resource limits (cgroups)
Layer 4: Syscall filtering (seccomp-BPF)
Layer 5: Filesystem restrictions (read-only root)
Layer 6: Network isolation (no network namespace)
\`\`\`

### Linux Namespaces

**PID Namespace**:
- Container sees only its own processes
- Cannot see or signal host processes
- Prevents process enumeration attacks

**Network Namespace**:
- No network interfaces (except loopback)
- Cannot make outbound connections
- Prevents data exfiltration

**Mount Namespace**:
- Isolated filesystem view
- Cannot see host mounts
- Prevents filesystem traversal

**IPC Namespace**:
- Isolated shared memory
- Cannot access host IPC
- Prevents inter-process attacks

**UTS Namespace**:
- Isolated hostname
- Cannot affect host identity

**User Namespace**:
- Root in container = unprivileged on host
- Prevents privilege escalation

### Cgroups (Control Groups)

**Memory Cgroup**:
\`\`\`yaml
Hard Limit: 512MB
Soft Limit: 256MB
Swap: Disabled
OOM Killer: Enabled
\`\`\`

**CPU Cgroup**:
\`\`\`yaml
Quota: 50000 (50% of one core)
Period: 100000
Shares: 1024
\`\`\`

**PID Cgroup**:
\`\`\`yaml
Max PIDs: 50
Prevents: Fork bombs
\`\`\`

**I/O Cgroup**:
\`\`\`yaml
Read BPS: 10MB/s
Write BPS: 10MB/s
\`\`\`

### Seccomp-BPF (Syscall Filtering)

**Whitelist Approach**:
\`\`\`json
{
  "defaultAction": "SCMP_ACT_KILL",
  "syscalls": [
    {
      "names": ["read", "write", "close", "mmap", "brk"],
      "action": "SCMP_ACT_ALLOW"
    },
    {
      "names": ["socket", "connect", "fork", "ptrace"],
      "action": "SCMP_ACT_ERRNO"
    }
  ]
}
\`\`\`

**Language-Specific Profiles**:
- JavaScript: Minimal syscalls (V8 runtime)
- Python: Additional syscalls for interpreter
- C++: Compilation and execution syscalls

### Security Monitoring

**Anomaly Detection**:
- Syscall rate monitoring (>10,000/sec = suspicious)
- Memory allocation patterns
- CPU usage spikes
- Repeated security violations

**Audit Logging**:
\`\`\`typescript
interface SecurityViolation {
  submissionId: string;
  userId: string;
  violationType: 'syscall' | 'network' | 'filesystem' | 'resource';
  attemptedAction: string;
  timestamp: Date;
}
\`\`\`

**Incident Response**:
1. Immediate termination of violating process
2. Log violation with full context
3. Flag user account after 5 violations/hour
4. Preserve forensic evidence (30 days)
5. Alert security team for coordinated attacks

## Scalability

### Horizontal Scaling

**API Servers**:
- Stateless design
- Load balancer distribution
- Session affinity not required
- Scale to N instances

**Worker Nodes**:
- Auto-scaling based on queue depth
- Scale up: Queue depth > 10 submissions
- Scale down: Workers idle > 5 minutes
- Min workers: 2, Max workers: 20

**Database**:
- Read replicas for queries
- Write master for submissions
- Connection pooling
- Query optimization

### Queue Management

**Redis-Based Queue**:
\`\`\`typescript
// Enqueue submission
await redis.rpush('queue', JSON.stringify(submission));

// Dequeue for processing
const submission = await redis.lpop('queue');

// Get queue position
const position = await redis.lpos('queue', submissionId);
\`\`\`

**Priority Queue** (Future Enhancement):
- Premium users get priority
- Simple problems processed first
- Load balancing across languages

### Caching Strategy

**Container Images**:
- Pre-pull images on worker nodes
- Layer caching for faster builds
- Minimal base images (<50MB)

**Compiled Code**:
- Cache WASM modules for popular problems
- Cache compiled binaries
- TTL: 1 hour

**Test Cases**:
- In-memory cache for active problems
- Redis cache for all problems
- Database as source of truth

### Resource Optimization

**Container Reuse**:
\`\`\`typescript
// Reuse container for same language
if (container.language === submission.language && container.idle) {
  return container;
}
\`\`\`

**Lazy Cleanup**:
- Don't destroy containers immediately
- Keep warm for 5 minutes
- Cleanup during low traffic

**Batch Processing**:
- Group submissions by language
- Process multiple test cases in one container
- Amortize startup costs

## Innovation

### 1. Client-Side Execution

**Novel Aspects**:
- Proxy-based memory tracking
- API restriction through undefined assignment
- Timeout via worker termination
- Zero-cost execution at scale

**Technical Challenges Solved**:
- Memory tracking without native APIs
- Secure execution without server
- Timeout enforcement in browser
- API restriction without CSP

### 2. Custom Orchestration

**Novel Aspects**:
- Fine-grained security policies
- Intelligent container pooling
- Predictive pre-warming
- Cost-optimized scaling

**Why Not Use Existing Solutions**:
- **Kubernetes**: Too heavy, complex, expensive
- **AWS Lambda**: Limited control, cold starts, vendor lock-in
- **Docker Swarm**: Limited security features
- **Custom Solution**: Full control, optimized for use case

### 3. Hybrid Intelligence

**Novel Aspects**:
- Code analysis for strategy selection
- Load-based routing
- Speculative execution
- Behavior prediction

**Machine Learning Opportunities** (Future):
- Predict execution time from code
- Predict optimal strategy
- Detect malicious patterns
- Optimize resource allocation

### 4. Advanced Isolation

**Novel Aspects**:
- Multi-layer defense in depth
- Language-specific seccomp profiles
- Anomaly detection
- Forensic evidence preservation

**Beyond Standard Practices**:
- Most platforms use single isolation layer
- We combine 6 layers for maximum security
- Real-time monitoring and response
- Comprehensive audit trail

## Trade-offs

### Client-Side vs Server-Side

| Aspect | Client-Side | Server-Side |
|--------|-------------|-------------|
| Cost | Free | $0.001/execution |
| Latency | <100ms | ~2000ms |
| Security | Limited | Maximum |
| Scalability | Infinite | Limited by workers |
| Language Support | JS, Python (Pyodide) | All languages |
| Resource Control | Limited | Precise |

**Decision**: Use client-side when safe, server-side when necessary

### Custom vs Existing Solutions

| Aspect | Custom | Kubernetes | AWS Lambda |
|--------|--------|------------|------------|
| Control | Maximum | Medium | Limited |
| Complexity | High | Very High | Low |
| Cost | Optimized | High | Medium |
| Learning | Deep | Steep | Shallow |
| Flexibility | Maximum | High | Limited |

**Decision**: Custom solution for technical depth and optimization

### Synchronous vs Asynchronous

| Aspect | Synchronous | Asynchronous |
|--------|-------------|--------------|
| Complexity | Low | High |
| Scalability | Limited | High |
| User Experience | Simple | Better |
| Implementation | Easy | Complex |

**Decision**: Asynchronous with WebSocket for real-time updates

### Monorepo vs Multi-Repo

| Aspect | Monorepo | Multi-Repo |
|--------|----------|------------|
| Code Sharing | Easy | Complex |
| Versioning | Simple | Complex |
| CI/CD | Unified | Separate |
| Team Coordination | Better | Harder |

**Decision**: Monorepo with npm workspaces for simplicity

## Conclusion

Let'sCode demonstrates technical depth through:

1. **Custom Solutions**: Built from scratch rather than using third-party APIs
2. **Innovation**: Novel approaches to execution, security, and scalability
3. **Security**: Multi-layer defense in depth with advanced isolation
4. **Scalability**: Intelligent routing and resource management
5. **Cost Efficiency**: Client-side execution when safe

The architecture balances security, performance, cost, and user experience while showcasing deep technical understanding of containerization, isolation, and distributed systems.


## API Documentation

### REST API Endpoints

#### Submit Code
```http
POST /api/submit
Content-Type: application/json

{
  "code": "function main(input) { return parseInt(input) * 2; }",
  "language": "javascript",
  "problemId": "problem-123",
  "userId": "user-456",
  "isCustomTest": false
}

Response: { "submissionId": "uuid" }
```

#### Get Submission
```http
GET /api/submission/:id

Response: {
  "id": "uuid",
  "status": "Completed",
  "verdict": { "status": "Accepted", ... },
  "testResults": [...]
}
```

#### Run Custom Test
```http
POST /api/test
Content-Type: application/json

{
  "code": "print(int(input()) * 2)",
  "input": "5",
  "language": "python"
}

Response: {
  "success": true,
  "output": "10\n",
  "executionTime": 123
}
```

### WebSocket Protocol

**Connection**: `ws://localhost:3001?userId=user-id`

**Status Update Message**:
```json
{
  "type": "status_update",
  "data": {
    "submissionId": "uuid",
    "status": "Running",
    "currentTest": 2,
    "testResult": { ... },
    "verdict": { ... }
  }
}
```

**System Status Message**:
```json
{
  "type": "system_status",
  "data": {
    "queueDepth": 15,
    "activeWorkers": 8,
    "avgExecutionTime": 1234
  }
}
```

## Innovation & Creative Approaches

### 1. Client-Side Execution Innovations

#### Proxy-Based Memory Tracking
Novel approach to track memory allocation without native APIs:

```javascript
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
```

**Benefits**:
- No native API dependencies
- Works in all modern browsers
- Accurate tracking for array allocations
- Extensible to other data structures

#### API Restriction Through Undefined Assignment
Simple yet effective API blocking:

```javascript
self.fetch = undefined;
self.XMLHttpRequest = undefined;
self.WebSocket = undefined;
self.importScripts = undefined;
```

**Benefits**:
- Simple implementation
- No CSP configuration needed
- Easy to extend

#### WebAssembly for C++/Rust
Browser-based compilation and execution for near-native performance with strong sandboxing.

#### Pyodide for Python
Full Python interpreter compiled to WebAssembly for browser execution with standard library support.

### 2. Custom Container Orchestration

**Why Build Custom Instead of Using Kubernetes?**

1. **Technical Depth**: Demonstrate understanding of containerization primitives
2. **Fine-Grained Control**: Custom security policies and resource limits
3. **Cost Optimization**: Intelligent pooling and reuse
4. **Simplicity**: Avoid Kubernetes complexity for our specific use case
5. **Learning**: Deep dive into Docker, namespaces, cgroups, seccomp

**Intelligent Container Pooling**:
```typescript
// Predict user's next language
const prediction = await predictLanguage(userId);
if (prediction.confidence > 0.7) {
  await prewarmContainer(prediction.language);
}
```

**Language-Specific Seccomp Profiles**:
Different languages need different syscalls - we create custom profiles:

```json
{
  "javascript": ["futex", "set_robust_list"],
  "python": ["openat", "stat", "getcwd"],
  "cpp": ["execve", "access"]
}
```

### 3. Intelligent Routing & Hybrid Execution

**Code Analysis for Strategy Selection**:
```typescript
function selectStrategy(code, language, systemLoad) {
  const analysis = analyzeCode(code);
  
  if (analysis.safe && analysis.simple) return 'client';
  if (analysis.unsafe || analysis.complex) return 'server';
  if (systemLoad > 0.8 && analysis.safe) return 'client';
  
  return 'hybrid';
}
```

**Factors Considered**:
- Code safety (file I/O, network, processes)
- Complexity (loops, recursion)
- Resource requirements (memory, CPU)
- System load (queue depth, worker utilization)
- Language capabilities (browser support)

**Speculative Execution**:
Pre-compile code based on typing patterns to reduce perceived latency:

```typescript
if (userTypingComplete() && codeValid()) {
  await precompile(code, language);
}
```

**Behavior-Based Pre-Warming**:
Predict user's next language and pre-provision containers based on submission history.

### 4. Advanced Security Innovations

**Six-Layer Defense in Depth**:
Most platforms use single isolation (containers OR VMs). We combine six layers:

1. Application-level restrictions (API blocking)
2. Process isolation (namespaces)
3. Resource limits (cgroups)
4. Syscall filtering (seccomp-BPF)
5. Filesystem restrictions (read-only root)
6. Network isolation (no network access)

**Real-Time Anomaly Detection**:
Monitor execution patterns to detect attacks:

```typescript
if (syscallsPerSecond > 10000) {
  terminateExecution();
  logSecurityViolation('Excessive syscall rate');
}
```

**Patterns Detected**:
- Excessive syscall rates (>10,000/sec)
- Rapid memory allocation
- Unusual CPU patterns
- Repeated security violations

**Forensic Evidence Preservation**:
Preserve full context for 30 days:
- Submitted code
- Input data
- Execution traces
- Container state
- System metrics

### 5. Scalability Innovations

**Predictive Auto-Scaling**:
Scale based on predictions, not just current load:

```typescript
const predictedLoad = await predictLoad(timeOfDay, dayOfWeek);
if (predictedLoad > threshold) {
  await scaleUp(predictedLoad);
}
```

**Intelligent Test Case Streaming**:
For test cases >100MB, stream data instead of loading into memory:

```typescript
async function* streamTestCase(testCaseId) {
  const stream = await getTestCaseStream(testCaseId);
  for await (const chunk of stream) {
    yield chunk;
  }
}
```

## Security Deep Dive

### Threat Model

**Threats Protected Against**:
1. Code Injection - Malicious code attempting to escape sandbox
2. Resource Exhaustion - Fork bombs, memory exhaustion, infinite loops
3. Data Exfiltration - Attempts to steal data or credentials
4. Privilege Escalation - Attempts to gain root or host access
5. Denial of Service - Attacks targeting system availability
6. Side-Channel Attacks - Timing attacks, speculative execution exploits

### Six-Layer Security Architecture

#### Layer 1: Application-Level Restrictions
```javascript
// Client-side execution
self.importScripts = undefined;
self.fetch = undefined;
self.XMLHttpRequest = undefined;
self.WebSocket = undefined;
self.indexedDB = undefined;
```

#### Layer 2: Linux Namespaces
- **PID Namespace**: Isolates process tree, container cannot see host processes
- **Network Namespace**: No network interfaces except loopback
- **Mount Namespace**: Isolated filesystem view
- **IPC Namespace**: Isolated shared memory and message queues
- **UTS Namespace**: Isolated hostname
- **User Namespace**: Root in container maps to unprivileged user on host

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
  Read BPS: 10MB/s
  Write BPS: 10MB/s
```

#### Layer 4: Seccomp-BPF (Syscall Filtering)
```json
{
  "defaultAction": "SCMP_ACT_KILL",
  "syscalls": [
    {
      "names": ["read", "write", "close", "mmap", "brk"],
      "action": "SCMP_ACT_ALLOW"
    },
    {
      "names": ["socket", "connect", "fork", "ptrace"],
      "action": "SCMP_ACT_ERRNO"
    }
  ]
}
```

**Blocked Syscalls**:
- `socket`, `connect`, `bind` - Network operations
- `fork`, `clone`, `vfork` - Process creation
- `ptrace` - Process debugging
- `mount`, `umount` - Filesystem operations
- `reboot`, `kexec_load` - System operations

#### Layer 5: Filesystem Restrictions
```yaml
ReadonlyRootfs: true
Volumes:
  /workspace: rw (temporary, 100MB limit)
  /tmp: rw (temporary)
```

**Prevented Operations**:
- Cannot modify system files
- Cannot install packages
- Cannot create persistent files
- Cannot access other users' files

#### Layer 6: Network Isolation
```yaml
NetworkMode: none
```

Complete network blocking - no HTTP requests, database connections, or data exfiltration possible.

### Security Monitoring

**Real-Time Monitoring**:
```typescript
// Syscall rate monitoring
if (syscallsPerSecond > 10000) {
  terminateExecution();
  logSecurityViolation('Excessive syscall rate');
}

// Memory allocation monitoring
if (memoryGrowthRate > 100MB/sec) {
  terminateExecution();
  logSecurityViolation('Rapid memory allocation');
}
```

**Audit Logging**:
```typescript
interface SecurityLog {
  timestamp: Date;
  submissionId: string;
  userId: string;
  violationType: string;
  attemptedAction: string;
  syscall?: string;
  containerState: object;
}
```

**Retention**:
- Security violations: 30 days
- Normal executions: 7 days
- Failed submissions: 14 days

### Incident Response

**Automated Response**:
1. Terminate violating execution
2. Log full context
3. Preserve forensic evidence
4. Block further submissions (if severe)

**Account Actions**:
- **Warning**: First offense
- **Temporary Ban**: 24 hours for repeated offenses
- **Permanent Ban**: Severe or persistent violations
- **Legal Action**: Criminal activity

## Implementation Notes

### Technology Stack

**Frontend**:
- React 18 for UI
- Monaco Editor 4.6 (VS Code's editor)
- TypeScript 5.3 for type safety
- Vite 5.0 for fast builds
- WebSocket client for real-time updates

**Backend**:
- Node.js 20 runtime
- TypeScript 5.3 for type safety
- Express 4.18 for REST API
- WebSocket (ws) 8.14 for real-time communication
- Docker (Dockerode) 4.0 for container management

**Infrastructure**:
- PostgreSQL 16 for persistent storage
- Redis 7 for queue management
- InfluxDB 2.7 for metrics and monitoring
- Docker & Docker Compose for containerization

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Load Balancer                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
┌───────────────▼──────────┐   ┌───────────▼──────────────┐
│   API Server Cluster     │   │  WebSocket Server        │
│   (Stateless)            │   │  (Sticky Sessions)       │
└───────────────┬──────────┘   └───────────┬──────────────┘
                │                           │
                └─────────────┬─────────────┘
                              │
                ┌─────────────▼─────────────┐
                │   Redis Queue Cluster     │
                └─────────────┬─────────────┘
                              │
                ┌─────────────▼─────────────┐
                │  Execution Worker Pool    │
                │  (Auto-scaling)           │
                └───────────────────────────┘
```

### Performance Targets

- **Client-side execution**: <500ms latency
- **Server-side execution**: <2s latency
- **Queue wait time**: <30s for 95% of submissions
- **Auto-scaling response**: <30s to provision workers
- **Throughput**: 1000+ submissions/second with auto-scaling

### Resource Optimization

**Container Reuse**:
```typescript
// Reuse container for same language
if (container.language === submission.language && container.idle) {
  return container;
}
```

**Lazy Cleanup**:
- Don't destroy containers immediately
- Keep warm for 5 minutes
- Cleanup during low traffic

**Batch Processing**:
- Group submissions by language
- Process multiple test cases in one container
- Amortize startup costs

**Caching Strategy**:
- Cache compiled WASM modules for popular problems
- Cache warm containers for frequently used languages
- Cache problem test cases in memory
- Redis cache for all problems
- Database as source of truth

## Conclusion

Let'sCode demonstrates technical depth through:

1. **Custom Solutions**: Built from scratch rather than using third-party APIs
2. **Innovation**: Novel approaches to execution, security, and scalability
3. **Security**: Multi-layer defense in depth with advanced isolation
4. **Scalability**: Intelligent routing and resource management
5. **Cost Efficiency**: Client-side execution when safe

The architecture balances security, performance, cost, and user experience while showcasing deep technical understanding of containerization, isolation, distributed systems, and full-stack development.
