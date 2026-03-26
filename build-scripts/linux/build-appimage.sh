#!/bin/bash
# build-appimage.sh - Linux AppImage Build

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🏗️  Building Linux AppImage..."

# Ensure Next.js is built
if [ ! -d ".next" ]; then
    echo "Building Next.js production bundle..."
    npm run build
fi

# Build with electron-builder
npx electron-builder --linux AppImage --x64

echo "✅ Linux AppImage created!"