#!/bin/bash
# build-portable-minimal.sh - Create minimal portable build
# Optimized for smaller disk footprint

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

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
echo "║  🐐 SUPER GOAT ROYALTIES APP - MINIMAL PORTABLE BUILD      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Create dist directory
mkdir -p dist

# Build Next.js if needed
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}Building Next.js production bundle...${NC}"
    npm run build
fi

echo -e "${BLUE}Creating minimal portable package...${NC}"

# Create portable package directory
PORTABLE_DIR="dist/goat-royalty-portable"
mkdir -p "$PORTABLE_DIR/app"

# Copy essential files only
echo -e "${CYAN}Copying essential application files...${NC}"
cp -r .next "$PORTABLE_DIR/app/"
cp -r public "$PORTABLE_DIR/app/"
cp -r pages "$PORTABLE_DIR/app/"
cp -r components "$PORTABLE_DIR/app/"
cp -r styles "$PORTABLE_DIR/app/"
cp -r lib "$PORTABLE_DIR/app/"
cp package.json "$PORTABLE_DIR/app/"
cp next.config.js "$PORTABLE_DIR/app/"
cp main.js "$PORTABLE_DIR/app/" 2>/dev/null || true
cp preload.js "$PORTABLE_DIR/app/" 2>/dev/null || true
cp start-server.js "$PORTABLE_DIR/app/"

# Copy production node_modules
echo -e "${CYAN}Copying production dependencies...${NC}"
cp -r node_modules "$PORTABLE_DIR/app/"

# Create startup scripts
echo -e "${CYAN}Creating startup scripts...${NC}"

# Linux/Mac startup script
cat > "$PORTABLE_DIR/start-linux.sh" << 'STARTSH'
#!/bin/bash
cd "$(dirname "$0")/app"
export NODE_ENV=production
export PORT=3000
echo "🐐 Starting SUPER GOAT ROYALTIES APP..."
echo "🌐 Opening http://localhost:3000"
node start-server.js &
SERVER_PID=$!
sleep 3
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000 2>/dev/null &
elif command -v open &> /dev/null; then
    open http://localhost:3000 2>/dev/null &
fi
echo "✅ Server running on http://localhost:3000"
echo "Press Ctrl+C to stop"
wait $SERVER_PID
STARTSH
chmod +x "$PORTABLE_DIR/start-linux.sh"

# Windows startup script
cat > "$PORTABLE_DIR/start-windows.bat" << 'STARTBAT'
@echo off
cd /d "%~dp0app"
set NODE_ENV=production
set PORT=3000
echo GOAT Starting SUPER GOAT ROYALTIES APP...
echo Opening http://localhost:3000
start /b node start-server.js
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo Server running on http://localhost:3000
echo Press Ctrl+C to stop
pause
STARTBAT

# macOS startup script
cat > "$PORTABLE_DIR/start-macos.sh" << 'STARTSH'
#!/bin/bash
cd "$(dirname "$0")/app"
export NODE_ENV=production
export PORT=3000
echo "🐐 Starting SUPER GOAT ROYALTIES APP..."
echo "🌐 Opening http://localhost:3000"
node start-server.js &
SERVER_PID=$!
sleep 3
open http://localhost:3000 2>/dev/null &
echo "✅ Server running on http://localhost:3000"
echo "Press Ctrl+C to stop"
wait $SERVER_PID
STARTSH
chmod +x "$PORTABLE_DIR/start-macos.sh"

# Create README
cat > "$PORTABLE_DIR/README.md" << 'README'
# 🐐 SUPER GOAT ROYALTIES APP - Portable Version

## Quick Start

### Linux
```bash
chmod +x start-linux.sh
./start-linux.sh
```

### macOS
```bash
chmod +x start-macos.sh
./start-macos.sh
```

### Windows
```
start-windows.bat
```

## Requirements
- Node.js 14 or higher
- 2GB RAM minimum
- 500MB disk space

## Features
- 🎵 Royalty tracking and management
- 🤖 AI-powered tools (6 integrated engines)
- 🎬 Video editing capabilities
- ⛓️ Blockchain verification
- 💰 Crypto mining integration
- 📡 DSP distribution
- 🎤 Voice command support
- 📊 Real-time dashboard
- 🔒 Self-healing system

## Support
Visit: https://supergoat.com/support

## License
Copyright © 2024 SuperGoat Inc. All rights reserved.
README

echo -e "${GREEN}✅ Portable package created!${NC}"

# Get size
DIR_SIZE=$(du -sh "$PORTABLE_DIR" | cut -f1)
echo -e "${BLUE}📦 Package size: ${DIR_SIZE}${NC}"

# Create archives
echo -e "${CYAN}Creating distribution archives...${NC}"

# Create tar.gz
tar -czf dist/goat-royalty-portable.tar.gz -C dist goat-royalty-portable
TAR_SIZE=$(du -sh dist/goat-royalty-portable.tar.gz | cut -f1)
echo -e "${GREEN}✓${NC} dist/goat-royalty-portable.tar.gz (${TAR_SIZE})"

# Create zip
cd dist && zip -rq goat-royalty-portable.zip goat-royalty-portable && cd ..
ZIP_SIZE=$(du -sh dist/goat-royalty-portable.zip | cut -f1)
echo -e "${GREEN}✓${NC} dist/goat-royalty-portable.zip (${ZIP_SIZE})"

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 BUILD COMPLETE!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}To run the app:${NC}"
echo -e "  1. Extract the archive"
echo -e "  2. Run the appropriate start script for your platform"
echo -e "  3. Open http://localhost:3000 in your browser"