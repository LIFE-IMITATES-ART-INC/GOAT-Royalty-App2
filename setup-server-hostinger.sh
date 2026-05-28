#!/bin/bash

################################################################################
# GOAT Royalty App - Automated Hostinger VPS Server Setup Script
#
# This script automates the complete server setup for the GOAT Royalty App
# on a fresh Hostinger VPS running Ubuntu 24.04 or 22.04
#
# Usage: bash setup-server-hostinger.sh
#
# Prerequisites:
# - Fresh Ubuntu VPS (24.04 or 22.04 LTS)
# - Root or sudo access
# - Internet connection
#
# Author: Harvey Miller / FASTASSMAN Publishing Inc
# Version: 1.0
# Date: 2026-03-04
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
HOSTINGER_API_TOKEN="${HOSTINGER_API_TOKEN:-CLqIY1SNx72M92XS0WOvVnE2TJQ8FkQNInso0oU86c149a44}"
APP_DIR="/root/GOAT-Royalty-App2"
NODE_VERSION="20"
APP_PORT="3002"
GITHUB_REPO="https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git"
SUPABASE_URL="https://xmvlnonsxmrpvlssjstl.supabase.co"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║     GOAT Royalty App - Hostinger VPS Server Setup             ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}▶ $1${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

check_os() {
    if [[ ! -f /etc/os-release ]]; then
        print_error "Cannot detect OS"
        exit 1
    fi

    source /etc/os-release
    if [[ "$ID" != "ubuntu" ]]; then
        print_warning "This script is designed for Ubuntu. Your OS: $ID"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    print_success "OS detected: Ubuntu $VERSION_ID"
}

################################################################################
# Installation Steps
################################################################################

step_1_update_system() {
    print_step "Step 1: Updating System Packages"

    apt update -y
    apt upgrade -y
    apt install -y curl wget git build-essential software-properties-common

    print_success "System updated"
}

step_2_install_nodejs() {
    print_step "Step 2: Installing Node.js $NODE_VERSION"

    # Remove old Node.js if exists
    apt remove -y nodejs npm 2>/dev/null || true

    # Install Node.js from NodeSource
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs

    # Verify installation
    NODE_VER=$(node --version)
    NPM_VER=$(npm --version)

    print_success "Node.js installed: $NODE_VER"
    print_success "npm installed: $NPM_VER"

    # Install global packages
    npm install -g pm2 yarn
    print_success "PM2 and Yarn installed globally"
}

step_3_install_nginx() {
    print_step "Step 3: Installing NGINX"

    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx

    print_success "NGINX installed and started"
}

step_4_configure_firewall() {
    print_step "Step 4: Configuring Firewall (UFW)"

    # Install UFW
    apt install -y ufw

    # Configure rules
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    ufw allow 3002/tcp comment 'GOAT App'

    # Enable firewall
    ufw --force enable

    print_success "Firewall configured"
    ufw status
}

step_5_configure_system() {
    print_step "Step 5: Configuring System Settings"

    # Set timezone
    timedatectl set-timezone America/New_York
    print_success "Timezone set to America/New_York"

    # Configure hostname
    hostnamectl set-hostname goat-royalty-server
    echo "127.0.0.1 goat-royalty-server" >> /etc/hosts
    print_success "Hostname configured"

    # Increase system limits
    cat >> /etc/security/limits.conf << 'EOF'
* soft nofile 65535
* hard nofile 65535
* soft nproc 32768
* hard nproc 32768
EOF
    print_success "System limits increased"
}

step_6_clone_repository() {
    print_step "Step 6: Cloning GOAT Royalty App Repository"

    # Remove old installation if exists
    if [[ -d "$APP_DIR" ]]; then
        print_warning "Existing installation found, backing up..."
        mv "$APP_DIR" "${APP_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    # Clone repository
    cd /root
    git clone "$GITHUB_REPO" "$APP_DIR"
    cd "$APP_DIR"

    print_success "Repository cloned to $APP_DIR"
}

step_7_configure_environment() {
    print_step "Step 7: Configuring Environment Variables"

    cd "$APP_DIR"

    # Get server IP
    SERVER_IP=$(curl -s ifconfig.me || echo "YOUR_SERVER_IP")

    # Create .env.production file
    cat > .env.production << EOF
# Application Configuration
NODE_ENV=production
PORT=$APP_PORT
NEXT_PUBLIC_APP_URL=http://$SERVER_IP:$APP_PORT

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtdmxub25zeG1ycHZsc3Nqc3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MTEyMDEsImV4cCI6MjA1NTQ4NzIwMX0.Fxqt3vJ4YqRqZxQJZqRqZxQJZqRqZxQJZqRqZxQJZqQ

# Hostinger API
HOSTINGER_API_TOKEN=$HOSTINGER_API_TOKEN

# Session & Auth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://$SERVER_IP:$APP_PORT

# Logging
LOG_LEVEL=info
LOG_FILE=$APP_DIR/logs/application.log
EOF

    chmod 600 .env.production
    ln -sf .env.production .env

    print_success "Environment variables configured"
    print_info "Server IP: $SERVER_IP"
}

step_8_install_dependencies() {
    print_step "Step 8: Installing Application Dependencies"

    cd "$APP_DIR"

    # Create logs directory
    mkdir -p logs
    chmod 755 logs

    # Install dependencies
    print_info "Installing Node.js dependencies (this may take a few minutes)..."
    npm install --production

    print_success "Dependencies installed"
}

step_9_build_application() {
    print_step "Step 9: Building Next.js Application"

    cd "$APP_DIR"

    print_info "Building application (this may take a few minutes)..."
    npm run build

    # Verify build
    if [[ -d ".next" ]]; then
        print_success "Application built successfully"
    else
        print_error "Build failed - .next directory not found"
        exit 1
    fi
}

step_10_configure_automation() {
    print_step "Step 10: Configuring Automation Engine"

    cd "$APP_DIR/automation"

    # Create automation .env
    cat > .env << EOF
NODE_ENV=production
SUPABASE_URL=$SUPABASE_URL
LOG_LEVEL=info
EOF

    # Install automation dependencies
    if [[ -f "package.json" ]]; then
        npm install
        print_success "Automation engine configured"
    else
        print_warning "No package.json found in automation directory"
    fi
}

step_11_setup_pm2() {
    print_step "Step 11: Setting Up PM2 Process Manager"

    cd "$APP_DIR"

    # Start applications with PM2
    pm2 start ecosystem.config.js

    # Save PM2 process list
    pm2 save

    # Setup PM2 startup script
    pm2 startup systemd -u root --hp /root

    print_success "PM2 configured and applications started"

    # Show PM2 status
    pm2 list
}

step_12_configure_nginx() {
    print_step "Step 12: Configuring NGINX Reverse Proxy"

    # Get server IP
    SERVER_IP=$(curl -s ifconfig.me || echo "_")

    # Create NGINX configuration
    cat > /etc/nginx/sites-available/goat-royalty << EOF
# GOAT Royalty App - NGINX Configuration

upstream goat_app {
    server 127.0.0.1:$APP_PORT;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_IP _;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client max body size
    client_max_body_size 50M;

    # Proxy settings
    location / {
        proxy_pass http://goat_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files optimization
    location /_next/static {
        proxy_pass http://goat_app;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    # Logging
    access_log /var/log/nginx/goat-royalty-access.log;
    error_log /var/log/nginx/goat-royalty-error.log;
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/goat-royalty /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # Test NGINX configuration
    nginx -t

    # Reload NGINX
    systemctl reload nginx

    print_success "NGINX configured"
}

step_13_setup_monitoring() {
    print_step "Step 13: Setting Up Monitoring and Health Checks"

    # Create scripts directory
    mkdir -p /root/scripts

    # Create health check script
    cat > /root/scripts/health-check.sh << 'EOF'
#!/bin/bash

LOG_FILE="/root/GOAT-Royalty-App2/logs/health-check.log"
APP_URL="http://localhost:3002"

echo "[$(date)] Starting health check" >> "$LOG_FILE"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "[$(date)] Web app is healthy (HTTP $HTTP_CODE)" >> "$LOG_FILE"
else
    echo "[$(date)] Web app is unhealthy (HTTP $HTTP_CODE) - Restarting" >> "$LOG_FILE"
    pm2 restart goat-royalty-web
fi
EOF

    chmod +x /root/scripts/health-check.sh

    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /root/scripts/health-check.sh") | crontab -

    print_success "Health monitoring configured (runs every 5 minutes)"
}

step_14_configure_security() {
    print_step "Step 14: Configuring Additional Security"

    # Install fail2ban
    apt install -y fail2ban

    # Configure fail2ban for SSH
    cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban

    print_success "Fail2ban configured"

    # Setup automatic security updates
    apt install -y unattended-upgrades
    dpkg-reconfigure --priority=low unattended-upgrades

    print_success "Automatic security updates enabled"
}

step_15_verify_installation() {
    print_step "Step 15: Verifying Installation"

    # Get server IP
    SERVER_IP=$(curl -s ifconfig.me || echo "YOUR_SERVER_IP")

    echo ""
    print_info "Checking services..."

    # Check NGINX
    if systemctl is-active --quiet nginx; then
        print_success "NGINX is running"
    else
        print_error "NGINX is not running"
    fi

    # Check PM2 processes
    PM2_STATUS=$(pm2 jlist | jq -r '.[].pm2_env.status' 2>/dev/null || echo "unknown")
    if [[ "$PM2_STATUS" == *"online"* ]]; then
        print_success "PM2 processes are online"
    else
        print_warning "PM2 process status: $PM2_STATUS"
    fi

    # Check application
    sleep 5
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT" 2>/dev/null || echo "000")
    if [[ "$HTTP_CODE" == "200" ]]; then
        print_success "Application is responding (HTTP $HTTP_CODE)"
    else
        print_warning "Application response: HTTP $HTTP_CODE"
    fi

    # Display PM2 list
    echo ""
    pm2 list
}

################################################################################
# Main Installation Process
################################################################################

main() {
    print_header

    # Pre-flight checks
    check_root
    check_os

    # Run installation steps
    step_1_update_system
    step_2_install_nodejs
    step_3_install_nginx
    step_4_configure_firewall
    step_5_configure_system
    step_6_clone_repository
    step_7_configure_environment
    step_8_install_dependencies
    step_9_build_application
    step_10_configure_automation
    step_11_setup_pm2
    step_12_configure_nginx
    step_13_setup_monitoring
    step_14_configure_security
    step_15_verify_installation

    # Final summary
    echo ""
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                  Installation Complete!                       ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    SERVER_IP=$(curl -s ifconfig.me || echo "YOUR_SERVER_IP")

    echo -e "${GREEN}"
    echo "✓ GOAT Royalty App is now running!"
    echo ""
    echo "Access your application:"
    echo "  → http://$SERVER_IP"
    echo "  → http://$SERVER_IP:$APP_PORT (direct)"
    echo ""
    echo "Management commands:"
    echo "  → pm2 list              # View running processes"
    echo "  → pm2 logs              # View application logs"
    echo "  → pm2 monit             # Monitor resources"
    echo "  → pm2 restart all       # Restart all processes"
    echo ""
    echo "Log locations:"
    echo "  → $APP_DIR/logs/"
    echo "  → /var/log/nginx/goat-royalty-*.log"
    echo ""
    echo "Documentation:"
    echo "  → $APP_DIR/GOAT-SERVER-SETUP-HOSTINGER.md"
    echo "  → $APP_DIR/HOSTINGER_DEPLOYMENT_GUIDE.md"
    echo -e "${NC}"

    print_info "Next steps:"
    echo "  1. Test the application in your browser"
    echo "  2. Configure SSL certificate (optional)"
    echo "  3. Set up custom domain (optional)"
    echo "  4. Configure API keys for AI services (optional)"

    echo ""
    print_success "Installation completed successfully!"
}

# Run main installation
main "$@"
