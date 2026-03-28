#!/bin/bash
# Enhanced macOS Build Script for GOAT Royalty App
# Creates DMG, PKG, and ZIP distributions

set -e

echo "🍎 GOAT Royalty App - macOS Build Script"
echo "========================================="

# Configuration
APP_NAME="GOAT Royalty App"
APP_ID="com.goatroyalty.app"
VERSION=${VERSION:-"1.0.0"}
DIST_DIR="dist"
BUILD_DIR="build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Clean previous builds
clean_builds() {
    echo "🧹 Cleaning previous builds..."
    rm -rf $DIST_DIR/*.dmg
    rm -rf $DIST_DIR/*.pkg
    rm -rf $DIST_DIR/*.zip
    rm -rf $DIST_DIR/mac
    rm -rf $DIST_DIR/mac-arm64
    rm -rf $BUILD_DIR
    mkdir -p $DIST_DIR
    mkdir -p $BUILD_DIR
}

# Install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    
    # Ensure electron-builder is available
    if ! command -v electron-builder &> /dev/null; then
        npm install -g electron-builder
    fi
}

# Build Next.js app
build_next() {
    echo "🏗️ Building Next.js application..."
    npm run build
    
    # Export static files if needed
    if grep -q "next export" package.json; then
        npm run export 2>/dev/null || true
    fi
}

# Build macOS DMG (Intel)
build_macos_dmg_x64() {
    echo "🍎 Building macOS DMG (Intel x64)..."
    
    electron-builder --mac dmg --x64 \
        --config.mac.category="public.app-category.finance" \
        --config.mac.icon="build/icon.icns" \
        --config.dmg.contents='[{"x":130,"y":220},{"x":410,"y":220,"type":"link","path":"/Applications"}]' \
        --config.dmg.window='{"width":540,"height":380}' \
        --config.dmg.artifactName="${APP_NAME}-${VERSION}-mac-x64.dmg"
    
    echo -e "${GREEN}✅ macOS DMG (Intel) created${NC}"
}

# Build macOS DMG (Apple Silicon)
build_macos_dmg_arm64() {
    echo "🍎 Building macOS DMG (Apple Silicon)..."
    
    electron-builder --mac dmg --arm64 \
        --config.mac.category="public.app-category.finance" \
        --config.mac.icon="build/icon.icns" \
        --config.dmg.contents='[{"x":130,"y":220},{"x":410,"y":220,"type":"link","path":"/Applications"}]' \
        --config.dmg.window='{"width":540,"height":380}' \
        --config.dmg.artifactName="${APP_NAME}-${VERSION}-mac-arm64.dmg"
    
    echo -e "${GREEN}✅ macOS DMG (Apple Silicon) created${NC}"
}

# Build macOS DMG (Universal)
build_macos_dmg_universal() {
    echo "🍎 Building macOS DMG (Universal)..."
    
    electron-builder --mac dmg --universal \
        --config.mac.category="public.app-category.finance" \
        --config.mac.icon="build/icon.icns" \
        --config.dmg.artifactName="${APP_NAME}-${VERSION}-mac-universal.dmg"
    
    echo -e "${GREEN}✅ macOS DMG (Universal) created${NC}"
}

# Build macOS PKG (for App Store)
build_macos_pkg() {
    echo "🍎 Building macOS PKG..."
    
    electron-builder --mac pkg --x64 --arm64 \
        --config.mac.category="public.app-category.finance" \
        --config.pkg.isBackgroundChecked=false \
        --config.pkg.allowAnywhere=true \
        --config.pkg.allowCurrentUserHome=true \
        --config.pkg.allowRootDirectory=true \
        --config.pkg.artifactName="${APP_NAME}-${VERSION}.pkg"
    
    echo -e "${GREEN}✅ macOS PKG created${NC}"
}

# Build macOS ZIP
build_macos_zip() {
    echo "🍎 Building macOS ZIP..."
    
    electron-builder --mac zip --x64 --arm64 \
        --config.mac.artifactName="${APP_NAME}-${VERSION}-mac.zip"
    
    echo -e "${GREEN}✅ macOS ZIP created${NC}"
}

# Build all macOS targets
build_macos_all() {
    echo "🍎 Building all macOS targets..."
    
    build_macos_dmg_x64
    build_macos_dmg_arm64
    # build_macos_dmg_universal  # Requires both x64 and arm64 builds
    build_macos_zip
}

# Create macOS build info
create_build_info() {
    echo "📝 Creating build information..."
    
    cat > $DIST_DIR/MACOS_BUILD_INFO.md << EOF
# GOAT Royalty App - macOS Build Information

## Build Details
- Version: $VERSION
- Build Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- Platform: macOS (Intel & Apple Silicon)
- Node Version: $(node -v)
- NPM Version: $(npm -v)

## Files Included
- *-mac-x64.dmg - Intel Mac installer
- *-mac-arm64.dmg - Apple Silicon Mac installer
- *-mac-universal.dmg - Universal (works on both)
- *.pkg - Package installer
- *-mac.zip - Portable zip archive

## System Requirements
- macOS 10.15 (Catalina) or later
- 4GB RAM minimum
- 500MB disk space

## Installation (DMG)
1. Download the appropriate DMG file:
   - *-x64.dmg for Intel Macs
   - *-arm64.dmg for M1/M2 Macs
   - *-universal.dmg for any Mac
2. Open the DMG file
3. Drag the app to Applications folder
4. Launch from Applications or Spotlight

## Security Notes
- Application is not notarized
- On first launch, right-click and select "Open"
- Or go to System Preferences > Security & Privacy > Open Anyway

## Code Signing (For Developers)
To sign the app for distribution:

\`\`\`bash
# Sign with your Developer ID
codesign --deep --force --verify --verbose \\
  --sign "Developer ID Application: Your Name (TEAMID)" \\
  --options runtime \\
  "dist/mac-arm64/GOAT Royalty App.app"

# Notarize with Apple
xcrun notarytool submit "dist/*.dmg" \\
  --apple-id "your@email.com" \\
  --password "@keychain:AC_PASSWORD" \\
  --team-id "TEAMID" \\
  --wait
\`\`\`

## Support
- GitHub: https://github.com/GOATROYALTY/goat-royalty-app
- Email: support@goatroyalty.com
EOF

    echo -e "${GREEN}✅ Build info created${NC}"
}

# Main build process
main() {
    echo "🚀 Starting macOS build process..."
    
    clean_builds
    install_deps
    build_next
    
    # Build based on argument
    case "${1:-all}" in
        "dmg-x64")
            build_macos_dmg_x64
            ;;
        "dmg-arm64")
            build_macos_dmg_arm64
            ;;
        "dmg-universal")
            build_macos_dmg_universal
            ;;
        "pkg")
            build_macos_pkg
            ;;
        "zip")
            build_macos_zip
            ;;
        "all")
            build_macos_all
            ;;
        *)
            echo "Unknown target: $1"
            echo "Usage: $0 [dmg-x64|dmg-arm64|dmg-universal|pkg|zip|all]"
            exit 1
            ;;
    esac
    
    create_build_info
    
    echo ""
    echo "========================================"
    echo -e "${GREEN}✅ macOS build completed successfully!${NC}"
    echo "========================================"
    echo ""
    echo "Output files in $DIST_DIR:"
    ls -la $DIST_DIR/*.dmg $DIST_DIR/*.pkg $DIST_DIR/*.zip 2>/dev/null || echo "No macOS packages found"
}

# Run main function
main "$@"