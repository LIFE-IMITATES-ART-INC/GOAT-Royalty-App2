#!/bin/bash
# ============================================================================
# SUPER GOAT ROYALTY — Local Build Script
# Build EXE, DMG, AppImage from your local machine
# Copyright © 2025 Harvey Miller (DJ Speedy) / GOAT Royalty
# ============================================================================

set -e

GOLD='\033[0;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GOLD}"
echo "  🐐⚡ SUPER GOAT ROYALTY — Build System"
echo "  ======================================="
echo -e "${NC}"

# Check Node.js
if ! command -v node &>/dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &>/dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"
echo -e "${BLUE}📁 Project: $PROJECT_DIR${NC}"

# Install dependencies
echo -e "\n${GOLD}[1/3] Installing dependencies...${NC}"
npm install

# Detect platform and build
echo -e "\n${GOLD}[2/3] Detecting platform...${NC}"
OS="$(uname -s)"
case "$OS" in
    Darwin)
        echo -e "${BLUE}🍎 macOS detected — Building DMG + ZIP${NC}"
        echo -e "\n${GOLD}[3/3] Building...${NC}"
        npm run build:mac
        echo -e "\n${GREEN}✅ macOS build complete!${NC}"
        echo -e "${GREEN}   Files in: dist/${NC}"
        ls -la dist/*.dmg dist/*.zip 2>/dev/null || ls -la dist/
        ;;
    Linux)
        echo -e "${BLUE}🐧 Linux detected — Building AppImage + DEB${NC}"
        echo -e "\n${GOLD}[3/3] Building...${NC}"
        npm run build:linux
        echo -e "\n${GREEN}✅ Linux build complete!${NC}"
        echo -e "${GREEN}   Files in: dist/${NC}"
        ls -la dist/*.AppImage dist/*.deb 2>/dev/null || ls -la dist/
        ;;
    MINGW*|MSYS*|CYGWIN*)
        echo -e "${BLUE}🪟 Windows detected — Building EXE + Portable${NC}"
        echo -e "\n${GOLD}[3/3] Building...${NC}"
        npm run build:win
        echo -e "\n${GREEN}✅ Windows build complete!${NC}"
        echo -e "${GREEN}   Files in: dist/${NC}"
        ls -la dist/*.exe 2>/dev/null || ls dist/
        ;;
    *)
        echo -e "${RED}❌ Unknown OS: $OS${NC}"
        echo -e "${GOLD}Building for all platforms (may fail on non-native)...${NC}"
        npm run build
        ;;
esac

echo -e "\n${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🐐⚡ BUILD COMPLETE!${NC}"
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"