#!/bin/bash
# build-standalone.sh - Create a standalone portable build
# This creates a smaller, more efficient build

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
echo "║  🐐 SUPER GOAT ROYALTIES APP - STANDALONE BUILD            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Create dist directory
mkdir -p dist

# Build Next.js if needed
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}Building Next.js production bundle...${NC}"
    npm run build
fi

echo -e "${BLUE}Creating standalone portable package...${NC}"

# Create portable package directory
PORTABLE_DIR="dist/GOAT-Royalty-App-Portable"
mkdir -p "$PORTABLE_DIR"

# Copy essential files
echo -e "${CYAN}Copying application files...${NC}"
cp -r .next "$PORTABLE_DIR/"
cp -r public "$PORTABLE_DIR/"
cp -r pages "$PORTABLE_DIR/"
cp -r components "$PORTABLE_DIR/"
cp -r styles "$PORTABLE_DIR/"
cp -r lib "$PORTABLE_DIR/"
cp -r data "$PORTABLE_DIR/" 2>/dev/null || true
cp package.json "$PORTABLE_DIR/"
cp next.config.js "$PORTABLE_DIR/"
cp main.js "$PORTABLE_DIR/"
cp preload.js "$PORTABLE_DIR/"
cp start-server.js "$PORTABLE_DIR/" 2>/dev/null || true

# Copy node_modules (production only)
echo -e "${CYAN}Copying production dependencies...${NC}"
cp -r node_modules "$PORTABLE_DIR/"

# Create startup scripts
echo -e "${CYAN}Creating startup scripts...${NC}"

# Linux/Mac startup script
cat > "$PORTABLE_DIR/start.sh" << 'STARTSH'
#!/bin/bash
cd "$(dirname "$0")"
export NODE_ENV=production
export PORT=3000
node start-server.js &
sleep 2
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi
wait
STARTSH
chmod +x "$PORTABLE_DIR/start.sh"

# Windows startup script
cat > "$PORTABLE_DIR/start.bat" << 'STARTBAT'
@echo off
cd /d "%~dp0"
set NODE_ENV=production
set PORT=3000
start /b node start-server.js
timeout /t 3 /nobreak >nul
start http://localhost:3000
STARTBAT

# Create README
cat > "$PORTABLE_DIR/README.md" << 'README'
# SUPER GOAT ROYALTIES APP - Portable Version

## Quick Start

### Linux/macOS
```bash
chmod +x start.sh
./start.sh
```

### Windows
```
start.bat
```

## Requirements
- Node.js 14 or higher
- 2GB RAM minimum
- 500MB disk space

## Features
- Royalty tracking and management
- AI-powered tools
- Music production suite
- Video editing capabilities
- Blockchain verification
- Crypto mining integration
- DSP distribution
- And much more!

## Support
Visit: https://supergoat.com/support

## License
Copyright © 2024 SuperGoat Inc. All rights reserved.
README

# Create tar.gz archive
echo -e "${CYAN}Creating tar.gz archive...${NC}"
tar -czf "dist/GOAT-Royalty-App-Portable-linux.tar.gz" -C dist "GOAT-Royalty-App-Portable"

# Create zip archive (for Windows users)
echo -e "${CYAN}Creating zip archive...${NC}"
cd dist && zip -rq "GOAT-Royalty-App-Portable.zip" "GOAT-Royalty-App-Portable" && cd ..

# Get sizes
TAR_SIZE=$(du -sh "dist/GOAT-Royalty-App-Portable-linux.tar.gz" | cut -f1)
ZIP_SIZE=$(du -sh "dist/GOAT-Royalty-App-Portable.zip" | cut -f1)
DIR_SIZE=$(du -sh "$PORTABLE_DIR" | cut -f1)

echo ""
echo -e "${GREEN}✅ Build Complete!${NC}"
echo ""
echo -e "${BLUE}📦 Output Files:${NC}"
echo -e "  ${GREEN}✓${NC} GOAT-Royalty-App-Portable/ (${DIR_SIZE})"
echo -e "  ${GREEN}✓${NC} GOAT-Royalty-App-Portable-linux.tar.gz (${TAR_SIZE})"
echo -e "  ${GREEN}✓${NC} GOAT-Royalty-App-Portable.zip (${ZIP_SIZE})"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 STANDALONE BUILD COMPLETE!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"