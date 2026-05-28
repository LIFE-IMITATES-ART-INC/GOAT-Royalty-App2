# GOAT Royalty App - Complete Server Setup Guide for Hostinger VPS

## Overview

This guide provides comprehensive instructions for setting up the GOAT Royalty application server infrastructure on Hostinger VPS, including all backend services, automation engines, and API integrations.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Architecture](#server-architecture)
3. [Initial VPS Setup](#initial-vps-setup)
4. [Server Component Installation](#server-component-installation)
5. [API Token Configuration](#api-token-configuration)
6. [Backend Services Setup](#backend-services-setup)
7. [Automation Engine Configuration](#automation-engine-configuration)
8. [Process Management with PM2](#process-management-with-pm2)
9. [Web Server Configuration (NGINX)](#web-server-configuration-nginx)
10. [Security Configuration](#security-configuration)
11. [Monitoring and Logging](#monitoring-and-logging)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts and Credentials

- **Hostinger VPS Account**: Active VPS hosting plan
- **Hostinger API Token**: `CLqIY1SNx72M92XS0WOvVnE2TJQ8FkQNInso0oU86c149a44`
- **GitHub Repository Access**: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2
- **Supabase Database**: https://xmvlnonsxmrpvlssjstl.supabase.co
- **SSH Key**: For secure server access

### Technical Requirements

- **VPS Specifications**:
  - Minimum: 2 vCPU, 4GB RAM, 80GB SSD
  - Recommended: 4 vCPU, 8GB RAM, 160GB SSD
- **Operating System**: Ubuntu 24.04 LTS (recommended) or 22.04 LTS
- **Node.js**: Version 20.x or higher
- **Python**: Version 3.10+ (for Atlas AI backend)
- **Port Access**: 80 (HTTP), 443 (HTTPS), 3002 (App), 22 (SSH)

---

## Server Architecture

The GOAT Royalty App consists of multiple server components:

### 1. Main Web Application
- **Framework**: Next.js 14
- **Port**: 3002
- **Process**: `goat-royalty-web`
- **Location**: `/root/GOAT-Royalty-App2`

### 2. Automation Engine
- **Runtime**: Node.js
- **Process**: `goat-automation`
- **Location**: `/root/GOAT-Royalty-App2/automation`
- **Components**:
  - Daily monitor (`daily-monitor.js`)
  - Royalty calculator (`royalty-calculator.js`)
  - Social media monitor (`social-media-monitor.js`)

### 3. Atlas AI Backend (Optional)
- **Framework**: Python Flask
- **Port**: 5000 (default)
- **Location**: `/root/GOAT-Royalty-App2/atlas-ai/backend`
- **Features**: GPT-2 model integration, ML processing

### 4. MS Vanessa Backend (Optional)
- **Runtime**: Node.js
- **Location**: `/root/GOAT-Royalty-App2/ms-vanessa-backend`

### 5. Web Server
- **Software**: NGINX
- **Role**: Reverse proxy, SSL termination, static file serving

---

## Initial VPS Setup

### Step 1: Access Your Hostinger VPS

1. **Log into Hostinger hPanel**:
   - URL: https://hpanel.hostinger.com
   - Use your Hostinger account credentials

2. **Get VPS Access Information**:
   ```
   VPS IP Address: Check hPanel dashboard
   SSH Username: root (or custom user)
   SSH Port: 22
   ```

3. **Connect via SSH**:
   ```bash
   ssh root@YOUR_VPS_IP
   ```

### Step 2: Update System Packages

```bash
# Update package lists
apt update

# Upgrade all packages
apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential software-properties-common
```

### Step 3: Configure System Settings

```bash
# Set timezone
timedatectl set-timezone America/New_York

# Configure hostname
hostnamectl set-hostname goat-royalty-server

# Update hosts file
echo "127.0.0.1 goat-royalty-server" >> /etc/hosts

# Increase system limits
cat >> /etc/security/limits.conf << EOF
* soft nofile 65535
* hard nofile 65535
* soft nproc 32768
* hard nproc 32768
EOF
```

---

## Server Component Installation

### Step 1: Install Node.js 20.x

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js and npm
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install global npm packages
npm install -g pm2 yarn
```

### Step 2: Install Python 3.10+ (for Atlas AI)

```bash
# Python 3 should be pre-installed on Ubuntu 24.04
python3 --version

# Install pip and venv
apt install -y python3-pip python3-venv

# Install Python dependencies
pip3 install flask sqlalchemy torch transformers
```

### Step 3: Install NGINX

```bash
# Install NGINX
apt install -y nginx

# Enable NGINX to start on boot
systemctl enable nginx

# Start NGINX
systemctl start nginx

# Verify status
systemctl status nginx
```

### Step 4: Install PostgreSQL Client (Optional)

```bash
# Install PostgreSQL client for database operations
apt install -y postgresql-client

# Test connection to Supabase (optional)
# psql "postgresql://postgres:[password]@db.xmvlnonsxmrpvlssjstl.supabase.co:5432/postgres"
```

---

## API Token Configuration

### Hostinger API Token Setup

The Hostinger API token enables programmatic deployment and management:

**Token**: `CLqIY1SNx72M92XS0WOvVnE2TJQ8FkQNInso0oU86c149a44`

#### 1. Store API Token Securely

```bash
# Create environment file for Hostinger API
mkdir -p /root/.config/hostinger
cat > /root/.config/hostinger/credentials << EOF
HOSTINGER_API_TOKEN=CLqIY1SNx72M92XS0WOvVnE2TJQ8FkQNInso0oU86c149a44
HOSTINGER_HOST=YOUR_VPS_IP
HOSTINGER_USERNAME=root
EOF

# Secure the credentials file
chmod 600 /root/.config/hostinger/credentials
```

#### 2. Configure GitHub Secrets (for CI/CD)

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
HOSTINGER_API_TOKEN=CLqIY1SNx72M92XS0WOvVnE2TJQ8FkQNInso0oU86c149a44
HOSTINGER_HOST=YOUR_VPS_IP
HOSTINGER_USERNAME=root
HOSTINGER_SSH_KEY=<your-private-ssh-key>
```

#### 3. Test API Access

```bash
# Test API token with curl
curl -X GET "https://api.hostinger.com/v1/status" \
  -H "Authorization: Bearer CLqIY1SNx72M92XS0WOvVnE2TJQ8FkQNInso0oU86c149a44" \
  -H "Content-Type: application/json"
```

---

## Backend Services Setup

### Step 1: Clone Repository

```bash
# Navigate to working directory
cd /root

# Clone GOAT Royalty App repository
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git

# Navigate to project directory
cd GOAT-Royalty-App2

# Verify repository
ls -la
```

### Step 2: Configure Environment Variables

```bash
# Create production environment file
cat > .env.production << EOF
# Application
NODE_ENV=production
PORT=3002
NEXT_PUBLIC_APP_URL=http://YOUR_VPS_IP:3002

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xmvlnonsxmrpvlssjstl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtdmxub25zeG1ycHZsc3Nqc3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MTEyMDEsImV4cCI6MjA1NTQ4NzIwMX0.Fxqt3vJ4YqRqZxQJZqRqZxQJZqRqZxQJZqRqZxQJZqQ
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# AI Services (Optional)
GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_KEY
OPENAI_API_KEY=YOUR_OPENAI_KEY
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY

# Hostinger API
HOSTINGER_API_TOKEN=CLqIY1SNx72M92XS0WOvVnE2TJQ8FkQNInso0oU86c149a44

# Session & Auth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://YOUR_VPS_IP:3002

# Logging
LOG_LEVEL=info
LOG_FILE=/root/GOAT-Royalty-App2/logs/application.log
EOF

# Secure environment file
chmod 600 .env.production

# Create symlink for .env
ln -sf .env.production .env
```

### Step 3: Install Dependencies

```bash
# Install Node.js dependencies
npm install --production

# Build Next.js application
npm run build

# Verify build output
ls -la .next/
```

### Step 4: Create Log Directory

```bash
# Create logs directory
mkdir -p /root/GOAT-Royalty-App2/logs

# Set permissions
chmod 755 /root/GOAT-Royalty-App2/logs
```

---

## Automation Engine Configuration

### Step 1: Configure Automation Scripts

```bash
# Navigate to automation directory
cd /root/GOAT-Royalty-App2/automation

# Create automation environment file
cat > .env << EOF
NODE_ENV=production
SUPABASE_URL=https://xmvlnonsxmrpvlssjstl.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_KEY
LOG_LEVEL=info
EOF

# Install automation dependencies
npm install
```

### Step 2: Test Automation Scripts

```bash
# Test daily monitor
node daily-monitor.js

# Test royalty calculator
node royalty-calculator.js

# Verify output
cat /root/GOAT-Royalty-App2/logs/automation-out.log
```

---

## Process Management with PM2

### Step 1: Review PM2 Configuration

The `ecosystem.config.js` file defines two processes:

```javascript
// Location: /root/GOAT-Royalty-App2/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'goat-royalty-web',
      script: 'npm',
      args: 'start -- -p 3002',
      cwd: '/root/GOAT-Royalty-App2',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      error_file: '/root/GOAT-Royalty-App2/logs/web-error.log',
      out_file: '/root/GOAT-Royalty-App2/logs/web-out.log'
    },
    {
      name: 'goat-automation',
      script: 'start-automation.js',
      cwd: '/root/GOAT-Royalty-App2/automation',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      cron_restart: '0 0 * * *' // Restart daily at midnight
    }
  ]
};
```

### Step 2: Start Services with PM2

```bash
# Navigate to project root
cd /root/GOAT-Royalty-App2

# Start all services
pm2 start ecosystem.config.js

# Verify services are running
pm2 list

# Expected output:
# ┌────┬────────────────────┬─────────┬─────────┬──────────┐
# │ id │ name               │ mode    │ status  │ memory   │
# ├────┼────────────────────┼─────────┼─────────┼──────────┤
# │ 0  │ goat-royalty-web   │ fork    │ online  │ 256 MB   │
# │ 1  │ goat-automation    │ fork    │ online  │ 128 MB   │
# └────┴────────────────────┴─────────┴─────────┴──────────┘
```

### Step 3: Configure PM2 Startup

```bash
# Save PM2 process list
pm2 save

# Generate startup script
pm2 startup

# Copy and execute the command shown by pm2 startup
# Example output will be something like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# Verify PM2 will start on boot
systemctl status pm2-root
```

### Step 4: PM2 Management Commands

```bash
# View logs
pm2 logs                          # All logs
pm2 logs goat-royalty-web         # Web app logs
pm2 logs goat-automation          # Automation logs

# Monitor resources
pm2 monit

# Restart services
pm2 restart all                   # Restart all
pm2 restart goat-royalty-web      # Restart web app

# Stop services
pm2 stop all                      # Stop all
pm2 stop goat-royalty-web         # Stop web app

# Delete services
pm2 delete all                    # Delete all
pm2 delete goat-royalty-web       # Delete web app

# Reload (zero-downtime restart)
pm2 reload all
```

---

## Web Server Configuration (NGINX)

### Step 1: Create NGINX Configuration

```bash
# Create NGINX site configuration
cat > /etc/nginx/sites-available/goat-royalty << 'EOF'
# GOAT Royalty App - NGINX Configuration

# Upstream for Next.js application
upstream goat_app {
    server 127.0.0.1:3002;
    keepalive 64;
}

# HTTP Server (Redirect to HTTPS in production)
server {
    listen 80;
    listen [::]:80;
    server_name YOUR_DOMAIN_OR_IP;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client max body size for uploads
    client_max_body_size 50M;

    # Proxy settings
    location / {
        proxy_pass http://goat_app;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Cache
        proxy_cache_bypass $http_upgrade;
    }

    # Static files optimization
    location /_next/static {
        proxy_pass http://goat_app;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://goat_app;
        access_log off;
    }

    # Logging
    access_log /var/log/nginx/goat-royalty-access.log;
    error_log /var/log/nginx/goat-royalty-error.log;
}
EOF
```

### Step 2: Enable Site and Test Configuration

```bash
# Create symbolic link to enable site
ln -sf /etc/nginx/sites-available/goat-royalty /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test NGINX configuration
nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload NGINX
systemctl reload nginx

# Verify NGINX status
systemctl status nginx
```

### Step 3: Configure NGINX Optimization

```bash
# Edit main NGINX configuration
cat >> /etc/nginx/nginx.conf.d/optimization.conf << 'EOF'
# Worker processes
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
}

http {
    # Connection optimization
    keepalive_timeout 65;
    keepalive_requests 100;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;
}
EOF

# Reload NGINX
systemctl reload nginx
```

---

## Security Configuration

### Step 1: Configure UFW Firewall

```bash
# Install UFW
apt install -y ufw

# Allow SSH (IMPORTANT: Do this first!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow application port (for direct access if needed)
ufw allow 3002/tcp

# Enable firewall
ufw --force enable

# Verify firewall status
ufw status verbose
```

### Step 2: Configure Fail2Ban

```bash
# Install Fail2Ban
apt install -y fail2ban

# Create SSH jail configuration
cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/goat-royalty-error.log
maxretry = 5
bantime = 3600
EOF

# Restart Fail2Ban
systemctl restart fail2ban

# Check status
fail2ban-client status
```

### Step 3: Setup SSH Key Authentication (Recommended)

```bash
# On your local machine, generate SSH key (if not already done)
# ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to server
# ssh-copy-id root@YOUR_VPS_IP

# On server, disable password authentication
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Restart SSH
systemctl restart sshd
```

### Step 4: Setup Automatic Security Updates

```bash
# Install unattended-upgrades
apt install -y unattended-upgrades

# Configure automatic updates
dpkg-reconfigure --priority=low unattended-upgrades

# Enable automatic updates
systemctl enable unattended-upgrades
```

---

## Monitoring and Logging

### Step 1: Configure Application Logging

```bash
# Create log rotation configuration
cat > /etc/logrotate.d/goat-royalty << EOF
/root/GOAT-Royalty-App2/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Test log rotation
logrotate -f /etc/logrotate.d/goat-royalty
```

### Step 2: Setup Health Monitoring Script

```bash
# Create health check script
cat > /root/scripts/health-check.sh << 'EOF'
#!/bin/bash

# GOAT Royalty App Health Check Script

LOG_FILE="/root/GOAT-Royalty-App2/logs/health-check.log"
APP_URL="http://localhost:3002"

echo "[$(date)] Starting health check" >> "$LOG_FILE"

# Check if web app is responding
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "[$(date)] Web app is healthy (HTTP $HTTP_CODE)" >> "$LOG_FILE"
else
    echo "[$(date)] Web app is unhealthy (HTTP $HTTP_CODE)" >> "$LOG_FILE"
    # Restart application
    pm2 restart goat-royalty-web
    echo "[$(date)] Restarted web app" >> "$LOG_FILE"
fi

# Check PM2 processes
PM2_STATUS=$(pm2 jlist)
echo "[$(date)] PM2 Status: $PM2_STATUS" >> "$LOG_FILE"

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "[$(date)] WARNING: Disk usage is at ${DISK_USAGE}%" >> "$LOG_FILE"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3*100/$2}')
if [ "$MEM_USAGE" -gt 85 ]; then
    echo "[$(date)] WARNING: Memory usage is at ${MEM_USAGE}%" >> "$LOG_FILE"
fi

echo "[$(date)] Health check completed" >> "$LOG_FILE"
EOF

# Make script executable
chmod +x /root/scripts/health-check.sh

# Add to crontab (run every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /root/scripts/health-check.sh") | crontab -
```

### Step 3: Setup Server Monitoring Dashboard

```bash
# Install htop for process monitoring
apt install -y htop

# Install nethogs for network monitoring
apt install -y nethogs

# Install iotop for disk I/O monitoring
apt install -y iotop

# View PM2 monitoring
pm2 monit

# View system resources
htop
```

### Step 4: Configure Email Alerts (Optional)

```bash
# Install mail utilities
apt install -y mailutils

# Configure alert script
cat > /root/scripts/alert.sh << 'EOF'
#!/bin/bash

RECIPIENT="your-email@example.com"
SUBJECT="GOAT Royalty Server Alert"
MESSAGE="$1"

echo "$MESSAGE" | mail -s "$SUBJECT" "$RECIPIENT"
EOF

chmod +x /root/scripts/alert.sh
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Application Not Starting

**Symptoms**: PM2 shows status as "errored" or "stopped"

**Solutions**:
```bash
# Check application logs
pm2 logs goat-royalty-web --lines 50

# Check for port conflicts
netstat -tulpn | grep 3002

# Verify environment variables
cat /root/GOAT-Royalty-App2/.env

# Rebuild application
cd /root/GOAT-Royalty-App2
npm run build
pm2 restart goat-royalty-web
```

#### Issue 2: NGINX 502 Bad Gateway

**Symptoms**: Browser shows "502 Bad Gateway" error

**Solutions**:
```bash
# Check if application is running
pm2 list

# Check NGINX error logs
tail -f /var/log/nginx/goat-royalty-error.log

# Test application directly
curl http://localhost:3002

# Restart services
pm2 restart goat-royalty-web
systemctl restart nginx
```

#### Issue 3: High Memory Usage

**Symptoms**: Server becomes slow or unresponsive

**Solutions**:
```bash
# Check memory usage
free -h
pm2 monit

# Restart application with memory limit
pm2 restart goat-royalty-web --max-memory-restart 1G

# Clear cache
sync; echo 3 > /proc/sys/vm/drop_caches
```

#### Issue 4: Database Connection Errors

**Symptoms**: Application logs show Supabase connection errors

**Solutions**:
```bash
# Verify Supabase URL and key
grep SUPABASE /root/GOAT-Royalty-App2/.env

# Test connection
curl https://xmvlnonsxmrpvlssjstl.supabase.co/rest/v1/

# Check firewall rules
ufw status verbose

# Verify network connectivity
ping xmvlnonsxmrpvlssjstl.supabase.co
```

#### Issue 5: Build Failures

**Symptoms**: `npm run build` fails with errors

**Solutions**:
```bash
# Clear build cache
rm -rf /root/GOAT-Royalty-App2/.next
rm -rf /root/GOAT-Royalty-App2/node_modules

# Reinstall dependencies
cd /root/GOAT-Royalty-App2
npm install

# Rebuild
npm run build

# Check Node.js version
node --version  # Should be v20.x or higher
```

### Diagnostic Commands

```bash
# Check all service status
systemctl status nginx
systemctl status pm2-root
pm2 list

# Check network connections
netstat -tulpn

# Check disk space
df -h

# Check memory
free -h

# Check CPU usage
top

# Check logs
tail -f /root/GOAT-Royalty-App2/logs/web-error.log
tail -f /var/log/nginx/goat-royalty-error.log
```

---

## Deployment Verification Checklist

After completing setup, verify everything is working:

- [ ] SSH access to VPS is working
- [ ] Node.js 20.x is installed (`node --version`)
- [ ] NGINX is running (`systemctl status nginx`)
- [ ] PM2 processes are online (`pm2 list`)
- [ ] Application responds on port 3002 (`curl http://localhost:3002`)
- [ ] NGINX proxy is working (`curl http://YOUR_VPS_IP`)
- [ ] Firewall is configured (`ufw status`)
- [ ] Logs are being written (`ls -lh /root/GOAT-Royalty-App2/logs/`)
- [ ] Supabase connection works (check app dashboard)
- [ ] Automation scripts are running (check logs)
- [ ] Health check script is in crontab (`crontab -l`)
- [ ] PM2 will restart on reboot (`systemctl status pm2-root`)
- [ ] All environment variables are set correctly

---

## Quick Reference Commands

### Application Management
```bash
# Start application
pm2 start ecosystem.config.js

# Restart application
pm2 restart all

# Stop application
pm2 stop all

# View logs
pm2 logs

# Monitor resources
pm2 monit
```

### Server Management
```bash
# Restart NGINX
systemctl restart nginx

# Check NGINX status
systemctl status nginx

# Test NGINX config
nginx -t

# Reload NGINX config
nginx -s reload
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory
free -h

# Check running processes
pm2 list
ps aux | grep node

# Check network
netstat -tulpn
```

### Logs
```bash
# Application logs
tail -f /root/GOAT-Royalty-App2/logs/web-error.log
tail -f /root/GOAT-Royalty-App2/logs/automation-out.log

# NGINX logs
tail -f /var/log/nginx/goat-royalty-access.log
tail -f /var/log/nginx/goat-royalty-error.log

# System logs
journalctl -u nginx -f
journalctl -u pm2-root -f
```

---

## Maintenance Tasks

### Daily
- Check application status via health monitoring
- Review error logs for critical issues
- Monitor disk space and memory usage

### Weekly
- Review all application logs
- Check for security updates: `apt update && apt list --upgradable`
- Verify backup integrity
- Review PM2 process metrics

### Monthly
- Update system packages: `apt update && apt upgrade -y`
- Update Node.js packages: `npm update`
- Rotate old logs manually if needed
- Review and optimize NGINX configuration
- Database maintenance (if needed)

### Quarterly
- Security audit
- Performance optimization review
- Update Node.js to latest LTS version if needed
- Review and update SSL certificates

---

## Support and Additional Resources

### Documentation Files
- **Quick Deploy**: `QUICK-DEPLOY-REFERENCE.md`
- **Deployment Summary**: `DEPLOYMENT-SUMMARY.md`
- **Hostinger Deployment**: `HOSTINGER_DEPLOYMENT_GUIDE.md`
- **Supabase Setup**: `SUPABASE_SETUP_GUIDE.md`

### External Resources
- **Hostinger Support**: https://www.hostinger.com/tutorials
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **NGINX Documentation**: https://nginx.org/en/docs/
- **Next.js Deployment**: https://nextjs.org/docs/deployment

### Emergency Contacts
- **Hostinger Support**: Via hPanel live chat
- **GitHub Issues**: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/issues

---

## Appendix: Server Specifications Reference

### Minimum VPS Requirements
```
CPU: 2 vCPU cores
RAM: 4 GB
Storage: 80 GB SSD
Bandwidth: 1 TB/month
OS: Ubuntu 24.04 LTS
```

### Recommended VPS Requirements
```
CPU: 4 vCPU cores
RAM: 8 GB
Storage: 160 GB SSD
Bandwidth: 2 TB/month
OS: Ubuntu 24.04 LTS
```

### Production VPS Requirements
```
CPU: 8 vCPU cores
RAM: 16 GB
Storage: 320 GB SSD
Bandwidth: 4 TB/month
OS: Ubuntu 24.04 LTS
Load Balancer: Yes
CDN: Cloudflare or similar
```

---

**Document Version**: 1.0
**Last Updated**: 2026-03-04
**Author**: Harvey Miller / FASTASSMAN Publishing Inc
**Status**: Production Ready

---

For deployment assistance or questions, refer to the troubleshooting section or consult the additional documentation files listed in the Support section.
