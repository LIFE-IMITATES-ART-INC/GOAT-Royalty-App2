#!/bin/bash
# Docker-based Multi-Platform Build Script for GOAT Royalty App
# Creates builds for Windows, macOS, and Linux using Docker containers

set -e

echo "🐳 GOAT Royalty App - Docker Multi-Platform Build"
echo "=================================================="

# Configuration
APP_NAME="goat-royalty-app"
VERSION=${VERSION:-"1.0.0"}
DIST_DIR="dist"
DOCKER_IMAGE="node:20-slim"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Docker availability
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}Docker daemon is not running. Please start Docker.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker is available${NC}"
}

# Create Dockerfile for build environment
create_dockerfile() {
    echo "📝 Creating build Dockerfile..."
    
    cat > Dockerfile.build << 'EOF'
FROM node:20-slim

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    wget \
    zip \
    unzip \
    nsis \
    wine64 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Default command
CMD ["bash"]
EOF

    echo -e "${GREEN}✅ Dockerfile created${NC}"
}

# Build Docker image
build_docker_image() {
    echo "🔨 Building Docker image..."
    
    docker build -t ${APP_NAME}-builder:${VERSION} -f Dockerfile.build .
    
    echo -e "${GREEN}✅ Docker image built${NC}"
}

# Build Linux version in Docker
build_linux_docker() {
    echo "🐧 Building Linux version in Docker..."
    
    docker run --rm \
        -v $(pwd)/dist:/app/dist \
        ${APP_NAME}-builder:${VERSION} \
        bash -c "npx electron-builder --linux tar.gz deb AppImage --x64"
    
    echo -e "${GREEN}✅ Linux build completed${NC}"
}

# Build Windows version in Docker
build_windows_docker() {
    echo "🪟 Building Windows version in Docker..."
    
    docker run --rm \
        -v $(pwd)/dist:/app/dist \
        ${APP_NAME}-builder:${VERSION} \
        bash -c "npx electron-builder --win nsis portable --x64"
    
    echo -e "${GREEN}✅ Windows build completed${NC}"
}

# Build all platforms in Docker
build_all_docker() {
    echo "🌍 Building all platforms in Docker..."
    
    # Create dist directory
    mkdir -p dist
    
    # Build using Docker
    docker run --rm \
        -v $(pwd):/app \
        -w /app \
        ${APP_NAME}-builder:${VERSION} \
        bash -c "
            npm run build && \
            npx electron-builder --linux tar.gz --x64 && \
            npx electron-builder --win nsis portable --x64
        "
    
    echo -e "${GREEN}✅ All builds completed${NC}"
}

# Create multi-arch build with QEMU
setup_qemu() {
    echo "🔧 Setting up QEMU for multi-arch builds..."
    
    docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
    
    echo -e "${GREEN}✅ QEMU configured${NC}"
}

# Build for ARM64 in Docker
build_arm64_docker() {
    echo "📱 Building ARM64 version in Docker..."
    
    setup_qemu
    
    docker run --rm \
        --platform linux/arm64 \
        -v $(pwd)/dist:/app/dist \
        ${APP_NAME}-builder:${VERSION} \
        bash -c "npx electron-builder --linux tar.gz --arm64"
    
    echo -e "${GREEN}✅ ARM64 build completed${NC}"
}

# Clean up Docker resources
cleanup_docker() {
    echo "🧹 Cleaning up Docker resources..."
    
    # Remove build image
    docker rmi ${APP_NAME}-builder:${VERSION} 2>/dev/null || true
    
    # Remove dangling images
    docker image prune -f
    
    # Remove Dockerfile
    rm -f Dockerfile.build
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Create build summary
create_build_summary() {
    echo "📊 Creating build summary..."
    
    cat > ${DIST_DIR}/BUILD_SUMMARY.md << EOF
# GOAT Royalty App - Docker Build Summary

## Build Information
- **Version:** ${VERSION}
- **Build Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- **Build Method:** Docker Multi-Platform
- **Docker Image:** ${DOCKER_IMAGE}

## Built Artifacts

### Linux
$(ls -la ${DIST_DIR}/*.tar.gz 2>/dev/null || echo "No Linux tar.gz found")
$(ls -la ${DIST_DIR}/*.deb 2>/dev/null || echo "No Linux deb found")
$(ls -la ${DIST_DIR}/*.AppImage 2>/dev/null || echo "No Linux AppImage found")

### Windows
$(ls -la ${DIST_DIR}/*.exe 2>/dev/null || echo "No Windows executables found")

### macOS
$(ls -la ${DIST_DIR}/*.dmg 2>/dev/null || echo "No macOS DMG found")

## Docker Build Advantages
- ✅ Consistent build environment
- ✅ No host system pollution
- ✅ Reproducible builds
- ✅ Multi-platform support
- ✅ CI/CD ready

## Usage

### Pull and run the built app:
\`\`\`bash
# Linux
tar -xzf goat-royalty-app-${VERSION}-linux-x64.tar.gz
./goat-royalty-app

# Windows
# Download and run the .exe installer

# macOS
# Open the .dmg file and drag to Applications
\`\`\`

## Support
- GitHub: https://github.com/GOATROYALTY/goat-royalty-app
- Email: support@goatroyalty.com
EOF

    echo -e "${GREEN}✅ Build summary created${NC}"
}

# Main build process
main() {
    echo "🚀 Starting Docker multi-platform build..."
    
    # Check prerequisites
    check_docker
    
    # Clean previous builds
    rm -rf ${DIST_DIR}
    mkdir -p ${DIST_DIR}
    
    # Create and build Docker image
    create_dockerfile
    build_docker_image
    
    # Build based on argument
    case "${1:-all}" in
        "linux")
            build_linux_docker
            ;;
        "windows")
            build_windows_docker
            ;;
        "arm64")
            build_arm64_docker
            ;;
        "all")
            build_all_docker
            ;;
        *)
            echo "Unknown target: $1"
            echo "Usage: $0 [linux|windows|arm64|all]"
            exit 1
            ;;
    esac
    
    # Create build summary
    create_build_summary
    
    # Cleanup
    cleanup_docker
    
    echo ""
    echo "=================================================="
    echo -e "${GREEN}✅ Docker build completed successfully!${NC}"
    echo "=================================================="
    echo ""
    echo "Output files in ${DIST_DIR}:"
    ls -la ${DIST_DIR}/
}

# Run main function
main "$@"