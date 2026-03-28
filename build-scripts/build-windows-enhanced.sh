#!/bin/bash
# Enhanced Windows Build Script for GOAT Royalty App
# Supports cross-compilation from Linux using Wine

set -e

echo "🔨 GOAT Royalty App - Windows Build Script"
echo "=========================================="

# Configuration
APP_NAME="goat-royalty-app"
VERSION=${VERSION:-"1.0.0"}
DIST_DIR="dist"
BUILD_DIR="build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for Wine (required for Windows builds on Linux)
check_wine() {
    if ! command -v wine &> /dev/null; then
        echo -e "${YELLOW}Wine not found. Installing Wine...${NC}"
        sudo apt-get update
        sudo apt-get install -y wine64 wine32
    fi
    echo -e "${GREEN}Wine is available${NC}"
}

# Clean previous builds
clean_builds() {
    echo "🧹 Cleaning previous builds..."
    rm -rf $DIST_DIR/*.exe
    rm -rf $DIST_DIR/win-unpacked
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

# Build Windows installer (NSIS)
build_windows_nsis() {
    echo "🪟 Building Windows NSIS installer..."
    
    electron-builder --win nsis --x64 \
        --config.nsis.oneClick=false \
        --config.nsis.allowToChangeInstallationDirectory=true \
        --config.nsis.createDesktopShortcut=true \
        --config.nsis.createStartMenuShortcut=true \
        --config.nsis.shortcutName="GOAT Royalty App" \
        --config.target=nsis
    
    echo -e "${GREEN}✅ Windows NSIS installer created${NC}"
}

# Build Windows portable
build_windows_portable() {
    echo "🪟 Building Windows portable executable..."
    
    electron-builder --win portable --x64 \
        --config.portable.artifactName="${APP_NAME}-${VERSION}-Portable.exe"
    
    echo -e "${GREEN}✅ Windows portable executable created${NC}"
}

# Build Windows AppX (for Microsoft Store)
build_windows_appx() {
    echo "🪟 Building Windows AppX (Microsoft Store)..."
    
    electron-builder --win appx --x64 \
        --config.appx.applicationId="com.goatroyalty.app" \
        --config.appx.identityName="GOATRoyaltyApp" \
        --config.appx.publisher="CN=GOATRoyalty" \
        --config.appx.displayName="GOAT Royalty App"
    
    echo -e "${GREEN}✅ Windows AppX package created${NC}"
}

# Build all Windows targets
build_windows_all() {
    echo "🪟 Building all Windows targets..."
    
    build_windows_nsis
    build_windows_portable
    build_windows_appx
}

# Create Windows build info
create_build_info() {
    echo "📝 Creating build information..."
    
    cat > $DIST_DIR/WINDOWS_BUILD_INFO.md << EOF
# GOAT Royalty App - Windows Build Information

## Build Details
- Version: $VERSION
- Build Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- Platform: Windows x64
- Node Version: $(node -v)
- NPM Version: $(npm -v)

## Files Included
- *.exe - Windows installer (NSIS)
- *-Portable.exe - Portable executable (no installation required)
- *.appx - Microsoft Store package

## System Requirements
- Windows 10 or later (64-bit)
- 4GB RAM minimum
- 500MB disk space

## Installation
1. Download the .exe installer
2. Run the installer
3. Follow the installation wizard
4. Launch the application from Start Menu or Desktop shortcut

## Portable Version
- No installation required
- Extract and run the .exe file
- Data is stored in the application directory

## Security
- Application is not code-signed
- Windows SmartScreen may show a warning
- Click "More info" and "Run anyway" to proceed

## Support
- GitHub: https://github.com/GOATROYALTY/goat-royalty-app
- Email: support@goatroyalty.com
EOF

    echo -e "${GREEN}✅ Build info created${NC}"
}

# Main build process
main() {
    echo "🚀 Starting Windows build process..."
    
    # check_wine  # Uncomment for cross-compilation
    clean_builds
    install_deps
    build_next
    
    # Build based on argument
    case "${1:-all}" in
        "nsis")
            build_windows_nsis
            ;;
        "portable")
            build_windows_portable
            ;;
        "appx")
            build_windows_appx
            ;;
        "all")
            build_windows_all
            ;;
        *)
            echo "Unknown target: $1"
            echo "Usage: $0 [nsis|portable|appx|all]"
            exit 1
            ;;
    esac
    
    create_build_info
    
    echo ""
    echo "========================================"
    echo -e "${GREEN}✅ Windows build completed successfully!${NC}"
    echo "========================================"
    echo ""
    echo "Output files in $DIST_DIR:"
    ls -la $DIST_DIR/*.exe $DIST_DIR/*.appx 2>/dev/null || echo "No Windows executables found"
}

# Run main function
main "$@"