#!/bin/bash
# SuperNinja AI - Build Script
# Builds EXE (Windows), DMG (Mac), and Portable versions

echo "============================================================"
echo "  SuperNinja AI - Desktop App Builder"
echo "  Building for Windows, macOS, and Linux"
echo "============================================================"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

# Build for all platforms
echo ""
echo "Building for Windows (EXE + Portable)..."
npm run build:win

echo ""
echo "Building for macOS (DMG)..."
npm run build:mac

echo ""
echo "Building for Linux (AppImage + DEB)..."
npm run build:linux

echo ""
echo "============================================================"
echo "  BUILD COMPLETE!"
echo "============================================================"
echo ""
echo "Output files in ./dist/"
echo ""
echo "  Windows:"
echo "    - SuperNinja-AI-1.0.0-Setup.exe (Installer)"
echo "    - SuperNinja-AI-1.0.0-Portable.exe (Portable)"
echo ""
echo "  macOS:"
echo "    - SuperNinja-AI-1.0.0.dmg"
echo ""
echo "  Linux:"
echo "    - SuperNinja-AI-1.0.0.AppImage"
echo "    - SuperNinja-AI-1.0.0.deb"
echo ""
ls -la dist/ 2>/dev/null