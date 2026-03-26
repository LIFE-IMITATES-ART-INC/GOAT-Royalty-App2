#!/bin/bash
# QUICK-INSTALL.sh - One-click install script for SUPER GOAT ROYALTIES APP
# Copy and paste this entire script into your terminal

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
echo "║  🐐 SUPER GOAT ROYALTIES APP - QUICK INSTALL               ║"
echo "║  Build, Run, and Deploy in One Command                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check for Node.js
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 14+ first.${NC}"
    echo -e "${YELLOW}Visit: https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo -e "${RED}Node.js version 14+ is required. Current version: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) detected${NC}"
echo -e "${GREEN}✓ npm $(npm --version) detected${NC}"

# Clone or update repository
APP_DIR="GOAT-Royalty-App2"
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Updating existing installation...${NC}"
    cd "$APP_DIR"
    git pull origin GOAT-APP 2>/dev/null || true
else
    echo -e "${CYAN}Cloning repository...${NC}"
    git clone --branch GOAT-APP https://github.com/LIFE-IMITATES-ART-INC/GOAT-Royalty-App2.git "$APP_DIR"
    cd "$APP_DIR"
fi

# Install dependencies
echo -e "${CYAN}Installing dependencies...${NC}"
npm install --production

# Create environment file
if [ ! -f ".env.local" ]; then
    echo -e "${CYAN}Creating environment configuration...${NC}"
    cp .env.example .env.local
    # Enable demo mode
    sed -i 's/ENABLE_DEMO_MODE=false/ENABLE_DEMO_MODE=true/' .env.local
    sed -i 's/ENABLE_DEMO_AUTH=false/ENABLE_DEMO_AUTH=true/' .env.local
fi

# Build Next.js
echo -e "${CYAN}Building application...${NC}"
npm run build

# Create startup scripts
echo -e "${CYAN}Creating startup scripts...${NC}"

# Linux/Mac
cat > start.sh << 'STARTSH'
#!/bin/bash
cd "$(dirname "$0")"
export NODE_ENV=production
export PORT=3000
echo "🐐 Starting SUPER GOAT ROYALTIES APP..."
npm start &
sleep 3
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi
echo "✅ Server running on http://localhost:3000"
echo "Press Ctrl+C to stop"
wait
STARTSH
chmod +x start.sh

# Windows
cat > start.bat << 'STARTBAT'
@echo off
cd /d "%~dp0"
set NODE_ENV=production
set PORT=3000
echo GOAT Starting SUPER GOAT ROYALTIES APP...
start /b npm start
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo Server running on http://localhost:3000
echo Press Ctrl+C to stop
pause
STARTBAT

echo ""
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 SUPER GOAT ROYALTIES APP is ready!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}To start the app:${NC}"
echo -e "  ${GREEN}./start.sh${NC} (Linux/macOS)"
echo -e "  ${GREEN}start.bat${NC} (Windows)"
echo ""
echo -e "${YELLOW}Or run directly:${NC}"
echo -e "  ${GREEN}npm start${NC}"
echo ""
echo -e "${YELLOW}Then open:${NC} http://localhost:3000"