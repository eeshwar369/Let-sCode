#!/bin/bash

# Build Docker images for all supported languages

set -e

echo "🐳 Building Docker images for language runtimes..."

echo "Building JavaScript runtime..."
docker build -t letscode-javascript:minimal -f docker/javascript.Dockerfile .

echo "Building Python runtime..."
docker build -t letscode-python:minimal -f docker/python.Dockerfile .

echo "Building C++ runtime..."
docker build -t letscode-cpp:minimal -f docker/cpp.Dockerfile .

echo "Building Rust runtime..."
docker build -t letscode-rust:minimal -f docker/rust.Dockerfile .

echo "✅ All images built successfully!"
echo ""
echo "Images:"
docker images | grep letscode
