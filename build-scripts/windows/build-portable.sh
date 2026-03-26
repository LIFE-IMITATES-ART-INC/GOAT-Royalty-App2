#!/bin/bash
# build-portable.sh - Windows Portable Build

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🏗️  Building Windows Portable Executable..."

# Ensure Next.js is built
if [ ! -d ".next" ]; then
    echo "Building Next.js production bundle..."
    npm run build
fi

# Build portable with electron-builder
npx electron-builder --win portable --x64

echo "✅ Windows Portable executable created!"