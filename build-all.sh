#!/bin/bash
# build-all.sh - Master Build Script for SUPER GOAT ROYALTIES APP

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🐐 SUPER GOAT ROYALTIES APP - MASTER BUILD SCRIPT        ║"
echo "║  Building Production-Ready Installers for All Platforms   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check for required tools
echo -e "${BLUE}Checking build environment...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed.${NC}"; exit 1; }

echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✓ npm: $(npm --version)${NC}"

# Create dist directory
mkdir -p dist

# Build counter
BUILDS_COMPLETED=0
BUILDS_FAILED=0

run_build() {
    local build_name=$1
    local build_script=$2
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Building: ${build_name}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if bash "$build_script"; then
        echo -e "${GREEN}✅ ${build_name} completed successfully${NC}"
        ((BUILDS_COMPLETED++))
    else
        echo -e "${RED}❌ ${build_name} failed${NC}"
        ((BUILDS_FAILED++))
    fi
    
    echo ""
}

# Detect platform
OS=$(uname -s)
ARCH=$(uname -m)

echo -e "${CYAN}Detected Platform: ${OS} ${ARCH}${NC}"
echo ""

# Run builds based on platform
case "$OS" in
    Linux*)
        # On Linux, we can build for Linux and Windows (using wine/electron-builder)
        run_build "Linux AppImage" "build-scripts/linux/build-appimage.sh"
        run_build "Linux .deb Package" "build-scripts/linux/build-deb.sh"
        run_build "Linux .tar.gz Archive" "build-scripts/linux/build-targz.sh"
        # Windows cross-compilation
        run_build "Windows EXE (Cross-Compiled)" "build-scripts/windows/build-portable.sh"
        ;;
    Darwin*)
        # On macOS, we can build for macOS and Linux
        run_build "macOS DMG Installer" "build-scripts/macos/build-dmg.sh"
        run_build "macOS App Bundle" "build-scripts/macos/build-app.sh"
        run_build "Linux AppImage (Cross-Compiled)" "build-scripts/linux/build-appimage.sh"
        ;;
    MINGW*|MSYS*|CYGWIN*)
        # On Windows
        run_build "Windows EXE Installer" "build-scripts/windows/build-nsis.sh"
        run_build "Windows Portable" "build-scripts/windows/build-portable.sh"
        ;;
    *)
        echo -e "${YELLOW}Unknown platform: ${OS}. Attempting generic build...${NC}"
        run_build "Portable Build" "build-scripts/portable/build-all-portable.sh"
        ;;
esac

# Summary
echo -e "${MAGENTA}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  BUILD SUMMARY                                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}✅ Builds Completed: ${BUILDS_COMPLETED}${NC}"
echo -e "${RED}❌ Builds Failed: ${BUILDS_FAILED}${NC}"

echo ""
echo -e "${BLUE}📦 Installers created in ./dist/:${NC}"
echo ""

if [ -d "dist" ] && [ "$(ls -A dist 2>/dev/null)" ]; then
    find dist -type f \( -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" -o -name "*.deb" -o -name "*.tar.gz" -o -name "*.zip" \) | sort | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo -e "  ${GREEN}✓${NC} $(basename "$file") (${size})"
    done
else
    echo -e "${YELLOW}No installers found in dist/${NC}"
fi

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 BUILD COMPLETE!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"

# Create manifest
cat > dist/MANIFEST.md << MANIFEST_EOF
# SUPER GOAT ROYALTIES APP - Distribution Manifest

## Version: 1.0.0
## Build Date: $(date)

### Windows Installers
- **GOAT_Royalty_App_Setup_v1.0.0.exe** - Full installer with uninstaller
- **GOAT_Royalty_App_Portable_Windows.exe** - Portable executable

### macOS Installers
- **GOAT_Royalty_App_v1.0.0.dmg** - DMG installer
- **GOAT_Royalty_App_v1.0.0.app** - App bundle

### Linux Installers
- **GOAT_Royalty_App_v1.0.0.AppImage** - Universal AppImage
- **goat-royalty_1.0.0_amd64.deb** - Debian/Ubuntu package
- **GOAT_Royalty_App_v1.0.0.tar.gz** - Universal tar.gz

### Features
- 242+ API endpoints
- 6 integrated AI engines
- Voice command support
- Real-time dashboard
- Self-healing system
- Professional security
- No login required (demo mode)
- Standalone operation

### System Requirements
- Windows 10/11 (64-bit)
- macOS 10.13+
- Linux (Ubuntu 18.04+, Debian 10+, etc.)
- 2GB RAM minimum
- 500MB disk space
- Node.js 14+ (for portable versions)

### Installation Instructions

#### Windows EXE
1. Run GOAT_Royalty_App_Setup_v1.0.0.exe
2. Follow the installation wizard
3. Launch from Start Menu

#### macOS DMG
1. Open GOAT_Royalty_App_v1.0.0.dmg
2. Drag app to Applications folder
3. Launch from Applications

#### Linux AppImage
1. chmod +x GOAT_Royalty_App_v1.0.0.AppImage
2. ./GOAT_Royalty_App_v1.0.0.AppImage

#### Linux .deb
1. sudo dpkg -i goat-royalty_1.0.0_amd64.deb
2. goat-royalty

### Support
For support, visit: https://supergoat.com/support

### License
Copyright © 2024 SuperGoat Inc. All rights reserved.
MANIFEST_EOF

echo -e "${YELLOW}📋 Manifest created: dist/MANIFEST.md${NC}"