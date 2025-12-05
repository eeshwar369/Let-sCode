# Let'sCode Execution Engine

A scalable code execution platform for competitive programming and coding challenges, featuring innovative client-side execution, custom container orchestration, and multi-layer security.

## Overview

Let'sCode is a code execution engine that safely runs user-submitted code in multiple programming languages. The system intelligently routes code execution between browser-based and server-based environments, providing instant feedback while maintaining security.

### Key Capabilities

- **Multiple Languages**: JavaScript, Python, C++, Rust
- **Smart Execution**: Automatically chooses between browser and server execution
- **Secure Isolation**: 6-layer security prevents malicious code from causing harm
- **Real-Time Feedback**: WebSocket updates show execution progress instantly
- **Auto-Scaling**: Handles thousands of concurrent submissions

## Architecture

The system has three main execution paths:

### 1. Client-Side Execution (Browser)
For safe, simple code that doesn't need file access or network:
- Runs in Web Workers (isolated from main browser thread)
- Zero server cost
- Instant execution (<500ms)
- Blocks dangerous APIs (fetch, file access, etc.)

### 2. Server-Side Execution (Docker Containers)
For complex code or code that needs system resources:
- Runs in isolated Docker containers
- 6 layers of security (namespaces, cgroups, seccomp, etc.)
- Resource limits (CPU, memory, time)
- Complete network isolation

### 3. Hybrid Execution
Intelligently routes between client and server based on:
- Code complexity analysis
- Current system load
- Language capabilities
- Security requirements

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                       │
│              (React + Monaco Editor)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   API Server                            │
│              (Express + WebSocket)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Strategy Router                            │
│         (Analyzes code & selects path)                  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌─────────┐
   │Browser │  │ Docker  │  │ Hybrid  │
   │Workers │  │Container│  │ (Both)  │
   └────────┘  └─────────┘  └─────────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│                Judge Engine                             │
│         (Compares output with expected)                 │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Database (PostgreSQL)                      │
│         (Stores submissions & results)                  │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Monaco Editor** - Code editor (same as VS Code)
- **TypeScript** - Type safety
- **Vite** - Build tool

### Backend
- **Node.js 20** - Runtime
- **Express** - REST API
- **WebSocket** - Real-time updates
- **Docker** - Container management
- **TypeScript** - Type safety

### Infrastructure
- **PostgreSQL** - Store submissions and results
- **Redis** - Queue management
- **InfluxDB** - Metrics and monitoring
- **Docker Compose** - Development environment

## Quick Start

### Prerequisites
- Node.js 18 or higher
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd letscode-execution-engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Start infrastructure (PostgreSQL, Redis, InfluxDB)**
```bash
docker-compose up -d postgres redis influxdb
```

4. **Build language runtime images**
```bash
docker build -t letscode-javascript:minimal -f docker/javascript.Dockerfile .
docker build -t letscode-python:minimal -f docker/python.Dockerfile .
docker build -t letscode-cpp:minimal -f docker/cpp.Dockerfile .
docker build -t letscode-rust:minimal -f docker/rust.Dockerfile .
```

5. **Start the application**
```bash
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- WebSocket: ws://localhost:3001

## Usage

### Submit Code via UI

1. Open http://localhost:5173
2. Select a programming language
3. Write your code in the editor
4. Click "Submit Code"
5. Watch real-time execution results

### Submit Code via API

```bash
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(int(input()) * 2)",
    "language": "python",
    "problemId": "test-1",
    "userId": "user-1",
    "isCustomTest": false
  }'
```

### Run Custom Test

```bash
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello World\")",
    "input": "",
    "language": "javascript"
  }'
```

## Security Features

The system uses 6 layers of security to prevent malicious code:

### Layer 1: Application-Level Restrictions
- Blocks dangerous browser APIs (fetch, XMLHttpRequest, WebSocket)
- Prevents file system access in browser

### Layer 2: Linux Namespaces
- **PID**: Isolated process tree
- **Network**: No network access
- **Mount**: Isolated filesystem
- **IPC**: Isolated inter-process communication
- **UTS**: Isolated hostname
- **User**: Unprivileged user mapping

### Layer 3: Cgroups (Resource Limits)
- **CPU**: 50% of one core maximum
- **Memory**: 512MB hard limit
- **Processes**: Maximum 50 PIDs (prevents fork bombs)
- **I/O**: 10MB/s read/write limits

### Layer 4: Seccomp-BPF (Syscall Filtering)
- Whitelist-only approach
- Blocks dangerous system calls (socket, fork, ptrace, etc.)
- Language-specific profiles

### Layer 5: Filesystem Restrictions
- Read-only root filesystem
- Limited temporary workspace (100MB)
- No persistent storage

### Layer 6: Network Isolation
- Complete network blocking
- No outbound connections possible

## Project Structure

```
letscode-execution-engine/
├── packages/
│   ├── shared/                 # Shared TypeScript types
│   │   └── src/types.ts
│   ├── backend/                # Node.js backend
│   │   └── src/
│   │       ├── api/           # REST API endpoints
│   │       ├── execution/     # Execution engines
│   │       ├── judge/         # Test case evaluation
│   │       ├── queue/         # Redis queue
│   │       ├── database/      # PostgreSQL
│   │       └── websocket/     # Real-time updates
│   └── frontend/              # React frontend
│       └── src/
│           ├── components/    # React components
│           └── App.tsx
├── docker/                    # Language runtime images
├── scripts/                   # Setup and utility scripts
├── docker-compose.yml         # Infrastructure setup
├── README.md                  # This file
└── DESIGN.md                  # Technical documentation
```

## Configuration

Create a `.env` file with these variables:

```env
# Database
DATABASE_URL=postgresql://letscode:letscode_dev@localhost:5432/letscode

# Redis
REDIS_URL=redis://localhost:6379

# InfluxDB
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=letscode_token

# Server Ports
API_PORT=3000
WS_PORT=3001

# Execution Limits
MAX_EXECUTION_TIME=5000
MAX_MEMORY_LIMIT=536870912
MAX_CPU_QUOTA=50000
```

## API Endpoints

### POST /api/submit
Submit code for execution
- **Body**: `{ code, language, problemId, userId, isCustomTest }`
- **Returns**: `{ submissionId }`

### GET /api/submission/:id
Get submission status and results
- **Returns**: Submission object with verdict and test results

### POST /api/test
Run custom test without saving
- **Body**: `{ code, input, language }`
- **Returns**: Execution result

### GET /api/health
Health check endpoint
- **Returns**: `{ status: "ok" }`

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run security tests
bash scripts/test-security.sh
```

## Performance

- **Client-side execution**: <500ms average
- **Server-side execution**: <2s average
- **Queue wait time**: <30s for 95% of submissions
- **Throughput**: 1000+ submissions/second with auto-scaling

## Documentation

- **README.md** (this file) - Getting started and usage
- **DESIGN.md** - Detailed architecture and technical design

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.

---

Built to demonstrate innovative approaches to secure code execution at scale.
