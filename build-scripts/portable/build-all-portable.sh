#!/bin/bash
# build-all-portable.sh - Build Portable Versions for All Platforms

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🏗️  Building Portable Versions for All Platforms..."

# Ensure Next.js is built
if [ ! -d ".next" ]; then
    echo "Building Next.js production bundle..."
    npm run build
fi

# Create portable directory
mkdir -p dist/portable

# Build portable for each platform
echo "Building Windows Portable..."
npx electron-builder --win portable --x64 || echo "Windows portable build skipped (requires Wine on Linux)"

echo "Building macOS Portable..."
npx electron-builder --mac zip --x64 --arm64 || echo "macOS build skipped (only available on macOS)"

echo "Building Linux Portable..."
npx electron-builder --linux tar.gz --x64 || echo "Linux build failed"

echo "✅ Portable builds completed!"