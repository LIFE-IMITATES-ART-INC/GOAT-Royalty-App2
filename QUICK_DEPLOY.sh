#!/bin/bash

###############################################################################
# 🐐 GOAT ROYALTY APP - ONE-CLICK DEPLOYMENT SCRIPT
# 
# Copy and paste this entire script into your terminal to:
# 1. Clone the repository
# 2. Install dependencies
# 3. Build the application
# 4. Create EXE, DMG, and portable versions
#
# Usage: Copy this entire script and paste into terminal
###############################################################################

echo "🐐 GOAT ROYALTY APP - QUICK DEPLOY"
echo "=================================="

# Configuration
REPO_URL="https://github.com/LIFE-IMITATES-ART-INC/GOAT-Royalty-App2.git"
APP_DIR="goat-royalty-app"

# Check for required tools
check_requirements() {
    echo "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required. Installing..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    echo "✅ Node.js: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is required"
        exit 1
    fi
    echo "✅ npm: $(npm --version)"
    
    # Check git
    if ! command -v git &> /dev/null; then
        echo "❌ git is required. Installing..."
        sudo apt-get install -y git
    fi
    echo "✅ git: $(git --version)"
    
    echo ""
}

# Clone repository
clone_repo() {
    echo "📥 Cloning repository..."
    
    if [ -d "$APP_DIR" ]; then
        echo "Directory $APP_DIR exists. Updating..."
        cd "$APP_DIR"
        git pull
    else
        git clone "$REPO_URL" "$APP_DIR"
        cd "$APP_DIR"
    fi
    
    echo "✅ Repository ready"
    echo ""
}

# Install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
}

# Build application
build_app() {
    echo "🔨 Building application..."
    
    # Build Next.js
    npm run build
    
    echo "✅ Application built"
    echo ""
}

# Create executables
create_executables() {
    echo "🚀 Creating executables..."
    
    # Windows EXE
    echo "Creating Windows EXE..."
    npx electron-builder --win --x64 || echo "Windows build requires Wine or Windows OS"
    
    # macOS DMG
    echo "Creating macOS DMG..."
    npx electron-builder --mac || echo "macOS build requires macOS"
    
    # Linux AppImage
    echo "Creating Linux AppImage..."
    npx electron-builder --linux AppImage --x64
    
    echo "✅ Executables created in dist/"
    echo ""
}

# Run the app
run_app() {
    echo "🎯 Starting GOAT Royalty App..."
    npm run dev
}

# Main execution
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║   🐐 GOAT ROYALTY APP - DEPLOYMENT SCRIPT 🐐                  ║"
    echo "║                                                               ║"
    echo "║   Features:                                                   ║"
    echo "║   • AI Agent System (Hierarchical Orchestrator)              ║"
    echo "║   • NVIDIA NIM Integration (215+ LLMs)                       ║"
    echo "║   • Blockchain Royalty Tracking                              ║"
    echo "║   • Video Editing Suite                                      ║"
    echo "║   • Audio Production Tools                                   ║"
    echo "║   • Workflow Automation                                      ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_requirements
    clone_repo
    install_deps
    build_app
    create_executables
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE! 🎉"
    echo ""
    echo "To run the app:"
    echo "  cd $APP_DIR && npm run dev"
    echo ""
    echo "To build for specific platforms:"
    echo "  npm run build:win     # Windows EXE + Portable"
    echo "  npm run build:mac     # macOS DMG"
    echo "  npm run build:linux   # Linux AppImage"
    echo ""
}

# Run main function
main