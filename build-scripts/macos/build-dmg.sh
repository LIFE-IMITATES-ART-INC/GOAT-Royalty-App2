#!/bin/bash
# build-dmg.sh - macOS DMG Installer Build

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🏗️  Building macOS DMG Installer..."

# Ensure Next.js is built
if [ ! -d ".next" ]; then
    echo "Building Next.js production bundle..."
    npm run build
fi

# Build with electron-builder
npx electron-builder --mac dmg --x64 --arm64

echo "✅ macOS DMG installer created!"