#!/bin/bash
set -e

# Install dependencies required for building and testing
if command -v npm >/dev/null 2>&1; then
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
else
  echo "npm not found. Please install Node.js before running this script." >&2
  exit 1
fi
