#!/bin/bash
# build-deb.sh - Linux Debian Package Build

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🏗️  Building Linux .deb Package..."

# Ensure Next.js is built
if [ ! -d ".next" ]; then
    echo "Building Next.js production bundle..."
    npm run build
fi

# Build with electron-builder
npx electron-builder --linux deb --x64

echo "✅ Linux .deb package created!"