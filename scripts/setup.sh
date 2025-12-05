#!/bin/bash

# Let'sCode Execution Engine Setup Script

set -e

echo "🚀 Setting up Let'sCode Execution Engine..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build Docker images for language runtimes
echo "🐳 Building Docker images..."
docker build -t letscode-javascript:minimal -f docker/javascript.Dockerfile .
docker build -t letscode-python:minimal -f docker/python.Dockerfile .
docker build -t letscode-cpp:minimal -f docker/cpp.Dockerfile .
docker build -t letscode-rust:minimal -f docker/rust.Dockerfile .

echo "✅ Docker images built successfully"

# Start infrastructure services
echo "🔧 Starting infrastructure services..."
docker-compose up -d postgres redis influxdb

echo "⏳ Waiting for services to be ready..."
sleep 10

# Initialize database
echo "💾 Initializing database..."
npm run build --workspace=@letscode/backend
node packages/backend/dist/index.js --init-db &
sleep 5
pkill -f "node packages/backend/dist/index.js"

echo "✅ Database initialized"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development servers:"
echo "  npm run dev"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:3000"
echo "  WebSocket: ws://localhost:3001"
echo ""
