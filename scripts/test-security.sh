#!/bin/bash

# Security testing script - attempts various attacks to verify isolation

set -e

echo "🔒 Running security tests..."

API_URL="http://localhost:3000/api"

# Test 1: File system access
echo "Test 1: Attempting file system access..."
curl -X POST $API_URL/test \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const fs = require(\"fs\"); console.log(fs.readFileSync(\"/etc/passwd\", \"utf8\"));",
    "input": "",
    "language": "javascript"
  }'

# Test 2: Network access
echo -e "\n\nTest 2: Attempting network access..."
curl -X POST $API_URL/test \
  -H "Content-Type: application/json" \
  -d '{
    "code": "fetch(\"http://evil.com\").then(r => console.log(r));",
    "input": "",
    "language": "javascript"
  }'

# Test 3: Process spawning
echo -e "\n\nTest 3: Attempting process spawning..."
curl -X POST $API_URL/test \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const { exec } = require(\"child_process\"); exec(\"ls -la\", (e, o) => console.log(o));",
    "input": "",
    "language": "javascript"
  }'

# Test 4: Infinite loop (timeout test)
echo -e "\n\nTest 4: Testing timeout with infinite loop..."
curl -X POST $API_URL/test \
  -H "Content-Type: application/json" \
  -d '{
    "code": "while(true) {}",
    "input": "",
    "language": "javascript"
  }'

# Test 5: Memory exhaustion
echo -e "\n\nTest 5: Testing memory limits..."
curl -X POST $API_URL/test \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const arr = new Array(1e9).fill(0); console.log(arr.length);",
    "input": "",
    "language": "javascript"
  }'

echo -e "\n\n✅ Security tests completed!"
echo "All tests should have been blocked or terminated."
