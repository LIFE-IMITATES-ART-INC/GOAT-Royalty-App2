#!/bin/bash
# build-app.sh - macOS App Bundle Build

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🏗️  Building macOS App Bundle..."

# Ensure Next.js is built
if [ ! -d ".next" ]; then
    echo "Building Next.js production bundle..."
    npm run build
fi

# Build with electron-builder
npx electron-builder --mac zip --x64 --arm64

echo "✅ macOS App Bundle created!"