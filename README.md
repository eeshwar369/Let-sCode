# Let'sCode Execution Engine

A scalable, innovative code execution platform demonstrating technical depth through custom-built solutions for competitive programming and coding challenges. This project showcases novel approaches to client-side execution, custom container orchestration, multi-layer security, and intelligent resource management.

## 🚀 Overview

Let'sCode is a comprehensive code execution engine that implements three execution tiers with intelligent routing:

1. **Client-Side Execution**: Browser-based execution using Web Workers, WebAssembly, and JavaScript interpreters (Pyodide)
2. **Server-Side Execution**: Custom Docker container orchestration with 6-layer security isolation
3. **Hybrid Intelligence**: Dynamic routing based on code analysis and system load

## ✨ Key Features

### Innovative Execution Strategies

- **Web Worker Sandboxing**: Isolated JavaScript execution in browser with API restrictions
- **WebAssembly Compilation**: C++/Rust compiled to WASM for secure browser execution
- **Pyodide Integration**: Python execution in browser using JavaScript-based interpreter
- **Custom Container Orchestration**: Docker-based isolation without relying on existing platforms
- **Advanced Security**: Multi-layer isolation (namespaces, cgroups, seccomp-BPF)

### Intelligent Routing

- **Code Analysis**: Automatic detection of unsafe operations and complexity estimation
- **Load-Based Routing**: Dynamic strategy selection based on system load
- **Pre-warming**: Predictive container provisioning based on user behavior
- **Speculative Execution**: Pre-compilation for likely submissions

### Scalability

- **Auto-Scaling Worker Pool**: Horizontal scaling based on queue depth
- **Redis-Based Queue**: Distributed submission queue management
- **Real-Time Updates**: WebSocket streaming of execution status
- **Resource Monitoring**: Millisecond-precision CPU and memory tracking

### Security

- **Defense in Depth**: Multiple isolation layers for maximum security
- **Syscall Whitelisting**: Seccomp-BPF filtering of dangerous system calls
- **Network Isolation**: Complete network blocking for execution environments
- **Filesystem Restrictions**: Read-only root filesystem with limited temp access
- **Process Limits**: Prevention of fork bombs and resource exhaustion

## 🏗️ Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │   Monaco     │  │  Execution   │  │   WebSocket        │   │
│  │   Editor     │  │  Controller  │  │   Client           │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Execution Strategy Router                    │
│              (Analyzes code & selects execution path)           │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Client-Side    │  │   Serverless     │  │    Hybrid        │
│   Execution      │  │   Execution      │  │    Execution     │
│                  │  │                  │  │                  │
│ • Web Workers    │  │ • Containers     │  │ • Pre-warming    │
│ • WASM           │  │ • Custom         │  │ • Speculative    │
│ • JS Interpreters│  │   Orchestration  │  │   Execution      │
└──────────────────┘  └──────────────────┘  └──────────────────┘
\`\`\`

## 📦 Project Structure

\`\`\`
letscode-execution-engine/
├── packages/
│   ├── shared/              # Shared TypeScript types
│   │   └── src/
│   │       └── types.ts
│   ├── backend/             # Node.js backend server
│   │   └── src/
│   │       ├── api/         # REST API endpoints
│   │       ├── execution/   # Execution engines
│   │       │   ├── client/  # Client-side executors
│   │       │   └── server/  # Server-side executors
│   │       ├── judge/       # Test case evaluation
│   │       ├── queue/       # Redis queue management
│   │       ├── database/    # PostgreSQL repository
│   │       └── websocket/   # Real-time communication
│   └── frontend/            # React frontend
│       └── src/
│           ├── components/  # React components
│           └── App.tsx
├── docker-compose.yml       # Development environment
└── README.md
\`\`\`

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **Monaco Editor** - Code editor (VS Code's editor)
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool

### Backend
- **Node.js** - Runtime environment
- **Express** - REST API framework
- **WebSocket (ws)** - Real-time communication
- **Docker** - Container orchestration
- **TypeScript** - Type-safe development

### Infrastructure
- **PostgreSQL** - Persistent storage
- **Redis** - Queue management
- **InfluxDB** - Metrics and monitoring
- **Docker** - Containerization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd letscode-execution-engine
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Start infrastructure services**
\`\`\`bash
docker-compose up -d postgres redis influxdb
\`\`\`

4. **Build Docker images for execution**
\`\`\`bash
# Build minimal language runtime images
docker build -t letscode-javascript:minimal -f docker/javascript.Dockerfile .
docker build -t letscode-python:minimal -f docker/python.Dockerfile .
docker build -t letscode-cpp:minimal -f docker/cpp.Dockerfile .
\`\`\`

5. **Start development servers**
\`\`\`bash
npm run dev
\`\`\`

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- WebSocket: ws://localhost:3001

### Using Docker Compose (Recommended)

\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
\`\`\`

## 📖 Usage

### Submitting Code

1. Open the application at http://localhost:5173
2. Select your programming language (JavaScript, Python, C++, Rust)
3. Write your code in the Monaco Editor
4. Click "Submit Code"
5. View real-time execution results in the right panel

### Custom Testing

Use the custom test feature to run code with your own input without affecting submission history.

### API Endpoints

#### Submit Code
\`\`\`http
POST /api/submit
Content-Type: application/json

{
  "code": "function main(input) { return input * 2; }",
  "language": "javascript",
  "problemId": "problem-1",
  "userId": "user-123",
  "isCustomTest": false
}
\`\`\`

#### Get Submission
\`\`\`http
GET /api/submission/:id
\`\`\`

#### Run Custom Test
\`\`\`http
POST /api/test
Content-Type: application/json

{
  "code": "print(input())",
  "input": "Hello World",
  "language": "python"
}
\`\`\`

## 🔒 Security Features

### Multi-Layer Isolation

1. **Linux Namespaces**: Process, network, mount, IPC, UTS, and user isolation
2. **Cgroups**: CPU, memory, PID, and I/O resource limits
3. **Seccomp-BPF**: Syscall filtering and whitelisting
4. **Read-Only Filesystem**: Immutable root filesystem
5. **No Network Access**: Complete network isolation
6. **Unprivileged User**: Execution as 'nobody' user

### Resource Limits

- **CPU**: 50% of one core (configurable)
- **Memory**: 512MB hard limit
- **Time**: 5 seconds execution timeout
- **Processes**: Maximum 50 PIDs
- **I/O**: 10MB/s read/write limits

### Security Monitoring

- Real-time security violation detection
- Anomaly detection (>10,000 syscalls/sec)
- Comprehensive audit logging
- Forensic evidence preservation (30 days)
- Account flagging for suspicious activity

## 📊 Monitoring & Metrics

### System Metrics

- Queue depth and wait times
- Worker utilization and throughput
- Execution time and memory usage
- Success/failure rates by language
- Security violation tracking

### Performance Targets

- Client-side execution: <500ms latency
- Server-side execution: <2s latency
- Queue wait time: <30s for 95% of submissions
- Auto-scaling response: <30s to provision workers

## 🧪 Testing

### Run All Tests
\`\`\`bash
npm test
\`\`\`

### Run Property-Based Tests
\`\`\`bash
npm run test:property
\`\`\`

### Test Coverage
\`\`\`bash
npm test -- --coverage
\`\`\`

## 🎯 Innovative Approaches

### 1. Client-Side Code Execution

**Web Workers with API Restrictions**
- Disabled dangerous APIs (fetch, XMLHttpRequest, WebSocket, importScripts)
- Memory tracking with Proxy-based allocation monitoring
- Timeout enforcement via worker termination
- Isolated thread execution

**WebAssembly Compilation**
- Browser-based C++/Rust compilation to WASM
- WASI-like environment with restricted syscalls
- Secure execution without server resources

**Pyodide for Python**
- Python interpreter compiled to WebAssembly
- Module import restrictions (os, subprocess, socket blocked)
- Full Python standard library support (safe subset)

### 2. Custom Container Orchestration

**Why Not Kubernetes?**
We built a custom orchestration system to demonstrate technical depth and have fine-grained control over:
- Container lifecycle management
- Resource allocation and monitoring
- Security policy enforcement
- Cost optimization through intelligent pooling

**Features**
- Minimal container images (<50MB)
- Sub-second container startup
- Intelligent worker pooling
- Automatic cleanup and resource reclamation

### 3. Advanced Isolation Techniques

**Seccomp-BPF Syscall Filtering**
- Whitelist-only approach (default deny)
- Language-specific syscall profiles
- Immediate termination on violation

**Linux Namespaces**
- PID namespace: Isolated process tree
- Network namespace: No network access
- Mount namespace: Isolated filesystem view
- User namespace: Unprivileged user mapping

**Cgroups v2**
- Memory limits with OOM killer
- CPU quota enforcement
- PID limits (fork bomb prevention)
- I/O bandwidth throttling

### 4. Intelligent Routing

**Code Analysis**
- Static analysis for unsafe operations
- Complexity estimation (loops, recursion)
- Resource requirement prediction
- Compilation requirement detection

**Dynamic Strategy Selection**
- Client-side for safe, simple code
- Server-side for complex/unsafe code
- Load-based routing when server is overloaded
- Hybrid with pre-warming for medium complexity

### 5. Scalability Patterns

**Auto-Scaling**
- Queue depth monitoring
- Horizontal worker scaling
- Predictive provisioning
- Graceful scale-down

**Pre-Warming**
- User behavior prediction
- Container pre-provisioning
- Library pre-compilation
- Warm pool management

**Speculative Execution**
- Typing pattern analysis
- Pre-compilation of likely submissions
- Reduced perceived latency

## 🔧 Configuration

### Environment Variables

\`\`\`env
# Database
DATABASE_URL=postgresql://letscode:letscode_dev@localhost:5432/letscode

# Redis
REDIS_URL=redis://localhost:6379

# InfluxDB
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=letscode_token
INFLUXDB_ORG=letscode
INFLUXDB_BUCKET=metrics

# Server Ports
API_PORT=3000
WS_PORT=3001

# Execution Limits
MAX_EXECUTION_TIME=5000
MAX_MEMORY_LIMIT=536870912
MAX_CPU_QUOTA=50000
MAX_PIDS=50

# Worker Pool
MIN_WORKERS=2
MAX_WORKERS=20
SCALE_UP_THRESHOLD=10
SCALE_DOWN_THRESHOLD=2
\`\`\`

## 📚 Documentation

- **README.md** (this file) - Project overview, setup, and usage
- **DESIGN.md** - Complete architecture, security, innovation, and API documentation

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Monaco Editor team for the excellent code editor
- Docker for containerization technology
- The open-source community for inspiration and tools

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ to demonstrate innovative approaches to code execution at scale**
