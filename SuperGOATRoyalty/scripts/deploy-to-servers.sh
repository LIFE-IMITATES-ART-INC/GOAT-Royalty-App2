#!/bin/bash
# ============================================================================
# SUPER GOAT ROYALTY — Server Deployment Script
# Deploys to both Hostinger VPS servers
# KVM2 (Primary): 72.61.193.184
# KVM8 (Backup):  93.127.214.171
# Copyright © 2025 Harvey Miller (DJ Speedy) / GOAT Royalty
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
GOLD='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GOLD}"
echo "  🐐⚡ SUPER GOAT ROYALTY — Server Deployment"
echo "  ============================================"
echo -e "${NC}"

# Configuration
REPO_URL="https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git"
APP_DIR="GOAT-Royalty-App2"
SSH_USER="${SSH_USER:-root}"
KVM2_IP="72.61.193.184"
KVM8_IP="93.127.214.171"
APP_PORT="${APP_PORT:-3000}"

# ============================================================================
# DEPLOY FUNCTION
# ============================================================================
deploy_to_server() {
    local SERVER_IP=$1
    local SERVER_NAME=$2
    
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GOLD}🚀 Deploying to ${SERVER_NAME} (${SERVER_IP})${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Test SSH connection
    echo -e "${GOLD}[1/8] Testing SSH connection...${NC}"
    if ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SSH_USER}@${SERVER_IP} "echo 'Connected'" 2>/dev/null; then
        echo -e "${RED}❌ Cannot connect to ${SERVER_IP}. Skipping.${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ SSH connection successful${NC}"
    
    # System update
    echo -e "${GOLD}[2/8] Updating system packages...${NC}"
    ssh ${SSH_USER}@${SERVER_IP} "apt-get update -qq && apt-get upgrade -y -qq" 2>/dev/null || true
    
    # Install Node.js 20 if needed
    echo -e "${GOLD}[3/8] Checking Node.js...${NC}"
    ssh ${SSH_USER}@${SERVER_IP} "
        if ! command -v node &>/dev/null || [[ \$(node -v | cut -d. -f1 | tr -d v) -lt 20 ]]; then
            echo 'Installing Node.js 20...'
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
        fi
        echo &quot;Node.js: \$(node -v) | npm: \$(npm -v)&quot;
    "
    
    # Install PM2 if needed
    echo -e "${GOLD}[4/8] Checking PM2...${NC}"
    ssh ${SSH_USER}@${SERVER_IP} "
        if ! command -v pm2 &>/dev/null; then
            npm install -g pm2
        fi
        echo &quot;PM2: \$(pm2 -v)&quot;
    "
    
    # Clone or pull repository
    echo -e "${GOLD}[5/8] Syncing repository...${NC}"
    ssh ${SSH_USER}@${SERVER_IP} "
        if [ -d ~/${APP_DIR} ]; then
            cd ~/${APP_DIR}
            git fetch origin main
            git reset --hard origin/main
            echo 'Repository updated (hard reset to origin/main)'
        else
            cd ~
            git clone ${REPO_URL}
            echo 'Repository cloned fresh'
        fi
    "
    
    # Install dependencies
    echo -e "${GOLD}[6/8] Installing dependencies...${NC}"
    ssh ${SSH_USER}@${SERVER_IP} "cd ~/${APP_DIR} && npm install --production 2>&1 | tail -3"
    
    # Create .env.local if not exists
    echo -e "${GOLD}[7/8] Checking environment config...${NC}"
    ssh ${SSH_USER}@${SERVER_IP} "
        if [ ! -f ~/${APP_DIR}/.env.local ]; then
            cat > ~/${APP_DIR}/.env.local << 'ENVEOF'
# Super GOAT Royalty — Environment Configuration
# Update these with your actual API keys

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GOOGLE_AI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-secret

NEXT_PUBLIC_APP_URL=http://${SERVER_IP}:${APP_PORT}
NODE_ENV=production
PORT=${APP_PORT}
ENVEOF
            echo '.env.local created (update with real keys!)'
        else
            echo '.env.local already exists'
        fi
    "
    
    # Build and start
    echo -e "${GOLD}[8/8] Building and starting app...${NC}"
    ssh ${SSH_USER}@${SERVER_IP} "
        cd ~/${APP_DIR}
        
        # Build Next.js
        echo 'Building Next.js app...'
        npm run build 2>&1 | tail -5
        
        # Stop existing PM2 process
        pm2 delete goat-app 2>/dev/null || true
        
        # Start with PM2
        pm2 start npm --name 'goat-app' -- start -- -p ${APP_PORT}
        pm2 save
        
        # Setup PM2 startup
        pm2 startup 2>/dev/null || true
        
        echo ''
        echo '========================================='
        pm2 status
        echo '========================================='
    "
    
    echo -e "\n${GREEN}✅ ${SERVER_NAME} deployment complete!${NC}"
    echo -e "${GREEN}   URL: http://${SERVER_IP}:${APP_PORT}${NC}"
}

# ============================================================================
# SETUP NGINX (Optional)
# ============================================================================
setup_nginx() {
    local SERVER_IP=$1
    echo -e "${GOLD}Setting up Nginx reverse proxy on ${SERVER_IP}...${NC}"
    
    ssh ${SSH_USER}@${SERVER_IP} "
        apt-get install -y nginx -qq
        
        cat > /etc/nginx/sites-available/goat-royalty << 'NGINXEOF'
server {
    listen 80;
    server_name ${SERVER_IP};
    
    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
NGINXEOF
        
        ln -sf /etc/nginx/sites-available/goat-royalty /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        nginx -t && systemctl restart nginx
        
        # Setup firewall
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow ${APP_PORT}/tcp
        echo 'y' | ufw enable 2>/dev/null || true
        
        echo 'Nginx configured and firewall updated'
    "
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================
echo -e "${GOLD}Select deployment target:${NC}"
echo "  1) KVM2 Primary (72.61.193.184)"
echo "  2) KVM8 Backup  (93.127.214.171)"
echo "  3) BOTH servers"
echo "  4) Both + Nginx setup"
echo ""
read -p "Choice [3]: " CHOICE
CHOICE=${CHOICE:-3}

case $CHOICE in
    1)
        deploy_to_server $KVM2_IP "KVM2 Primary"
        ;;
    2)
        deploy_to_server $KVM8_IP "KVM8 Backup"
        ;;
    3)
        deploy_to_server $KVM2_IP "KVM2 Primary"
        deploy_to_server $KVM8_IP "KVM8 Backup"
        ;;
    4)
        deploy_to_server $KVM2_IP "KVM2 Primary"
        setup_nginx $KVM2_IP
        deploy_to_server $KVM8_IP "KVM8 Backup"
        setup_nginx $KVM8_IP
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🐐⚡ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  KVM2 Primary: ${GREEN}http://72.61.193.184:${APP_PORT}${NC}"
echo -e "  KVM8 Backup:  ${GREEN}http://93.127.214.171:${APP_PORT}${NC}"
echo ""
echo -e "  Manage: ${BLUE}ssh ${SSH_USER}@<IP> 'pm2 status'${NC}"
echo -e "  Logs:   ${BLUE}ssh ${SSH_USER}@<IP> 'pm2 logs goat-app'${NC}"
echo -e "  Restart:${BLUE}ssh ${SSH_USER}@<IP> 'pm2 restart goat-app'${NC}"
echo ""