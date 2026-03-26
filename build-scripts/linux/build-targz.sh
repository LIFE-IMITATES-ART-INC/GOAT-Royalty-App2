#!/bin/bash
# build-targz.sh - Linux tar.gz Archive Build

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🏗️  Building Linux tar.gz Archive..."

# Ensure Next.js is built
if [ ! -d ".next" ]; then
    echo "Building Next.js production bundle..."
    npm run build
fi

# Build with electron-builder
npx electron-builder --linux tar.gz --x64

echo "✅ Linux tar.gz archive created!"