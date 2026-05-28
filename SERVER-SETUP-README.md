# GOAT Royalty App - Server Setup Quick Start

## Overview

This directory contains complete server setup documentation and automation scripts for deploying the GOAT Royalty App on Hostinger VPS.

---

## 📚 Documentation Files

### Main Server Setup Guide
**📖 [GOAT-SERVER-SETUP-HOSTINGER.md](./GOAT-SERVER-SETUP-HOSTINGER.md)**
- Complete, step-by-step server setup guide
- Covers all backend services and architecture
- Includes API token configuration
- Security, monitoring, and troubleshooting sections
- **START HERE** for manual setup

### Deployment Guides
- **[HOSTINGER_DEPLOYMENT_GUIDE.md](./HOSTINGER_DEPLOYMENT_GUIDE.md)** - Hostinger-specific deployment options
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - General production deployment guide
- **[DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md)** - Quick deployment checklist
- **[VPS-DEPLOYMENT-GUIDE.md](./VPS-DEPLOYMENT-GUIDE.md)** - Ubuntu VPS setup guide

### Quick Reference
- **[QUICK-DEPLOY-REFERENCE.md](./QUICK-DEPLOY-REFERENCE.md)** - Quick reference card
- **[START-HERE.md](./START-HERE.md)** - Choose your deployment path

---

## 🚀 Quick Start Options

### Option 1: Automated Setup (Recommended)

Use the automated setup script for a complete, hands-off installation:

```bash
# SSH into your Hostinger VPS
ssh root@YOUR_VPS_IP

# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App2/main/setup-server-hostinger.sh | bash
```

Or if you've already cloned the repository:

```bash
cd /root/GOAT-Royalty-App2
chmod +x setup-server-hostinger.sh
./setup-server-hostinger.sh
```

**What the script does:**
- ✅ Updates system packages
- ✅ Installs Node.js 20.x
- ✅ Installs and configures NGINX
- ✅ Configures firewall (UFW)
- ✅ Clones the repository
- ✅ Configures environment variables (including API token)
- ✅ Builds the application
- ✅ Sets up PM2 process management
- ✅ Configures health monitoring
- ✅ Sets up security (Fail2ban, auto-updates)
- ✅ Verifies installation

**Time:** ~15-20 minutes

### Option 2: Manual Setup

Follow the comprehensive guide for manual setup:

1. Read **[GOAT-SERVER-SETUP-HOSTINGER.md](./GOAT-SERVER-SETUP-HOSTINGER.md)**
2. Follow each section step-by-step
3. Customize configuration as needed

**Time:** ~45-60 minutes

### Option 3: GitHub Actions CI/CD

For automated deployments on every push:

1. Configure GitHub Secrets (see [HOSTINGER_DEPLOYMENT_GUIDE.md](./HOSTINGER_DEPLOYMENT_GUIDE.md#option-3-github-actions-cicd))
2. Push to main branch
3. GitHub Actions handles deployment automatically

---

## 🔑 Hostinger API Token

Your Hostinger API token for programmatic deployment:

```
CLqIY1SNx72M92XS0WOvVnE2TJQ8FkQNInso0oU86c149a44
```

**⚠️ Security Note:** This token is configured in:
- `deploy-hostinger.js` (for local deployment)
- `setup-server-hostinger.sh` (for automated setup)
- GitHub Secrets (for CI/CD)

Store it securely and never commit it to public repositories outside this project.

---

## 📋 Prerequisites

### For Automated Setup
- Fresh Ubuntu VPS (24.04 or 22.04 LTS)
- Root or sudo access
- SSH connection to VPS

### For Manual Setup
- Everything above, plus:
- Basic Linux command-line knowledge
- Text editor familiarity (nano, vim)

### VPS Specifications

**Minimum:**
- 2 vCPU cores
- 4 GB RAM
- 80 GB SSD storage
- Ubuntu 24.04 LTS

**Recommended:**
- 4 vCPU cores
- 8 GB RAM
- 160 GB SSD storage
- Ubuntu 24.04 LTS

---

## 🏗️ Server Architecture

The GOAT Royalty App consists of multiple components:

### 1. Main Web Application
- **Framework:** Next.js 14
- **Port:** 3002
- **Process:** goat-royalty-web (PM2)

### 2. Automation Engine
- **Runtime:** Node.js
- **Process:** goat-automation (PM2)
- **Features:** Daily monitoring, royalty calculations, social media tracking

### 3. Web Server
- **Software:** NGINX
- **Role:** Reverse proxy, SSL termination

### 4. Database
- **Service:** Supabase (PostgreSQL)
- **URL:** https://xmvlnonsxmrpvlssjstl.supabase.co

---

## 🛠️ Management Commands

### Application Management
```bash
pm2 list              # View all processes
pm2 logs              # View logs (all processes)
pm2 logs goat-royalty-web   # Web app logs
pm2 monit             # Monitor resources
pm2 restart all       # Restart all processes
pm2 stop all          # Stop all processes
```

### Server Management
```bash
systemctl status nginx       # Check NGINX status
systemctl restart nginx      # Restart NGINX
nginx -t                     # Test NGINX config
```

### System Monitoring
```bash
df -h                 # Check disk space
free -h               # Check memory usage
htop                  # Interactive process monitor
```

---

## 🔍 Verification

After installation, verify everything is working:

### 1. Check Services
```bash
systemctl status nginx       # Should be "active (running)"
pm2 list                     # Both processes should be "online"
```

### 2. Test Application
```bash
# Test locally
curl http://localhost:3002

# Should return HTML content with status 200
```

### 3. Access in Browser
```
http://YOUR_VPS_IP
```

You should see the GOAT Royalty App dashboard.

---

## 📊 What You Get

After successful setup:

- ✅ **Web Application** running on port 3002
- ✅ **NGINX** reverse proxy on ports 80/443
- ✅ **PM2** managing application processes
- ✅ **Automation Engine** running 24/7
- ✅ **Health Monitoring** (checks every 5 minutes)
- ✅ **Firewall** configured and enabled
- ✅ **Security** (Fail2ban, auto-updates)
- ✅ **Logging** configured and rotating

### Access Points
- **Main URL:** http://YOUR_VPS_IP
- **Direct Access:** http://YOUR_VPS_IP:3002
- **Dashboard:** http://YOUR_VPS_IP/dashboard
- **API:** http://YOUR_VPS_IP/api/*

---

## 🔒 Security Features

The setup includes:

- **Firewall (UFW):** Allows only necessary ports (22, 80, 443, 3002)
- **Fail2ban:** Protects against brute-force SSH attacks
- **Security Headers:** X-Frame-Options, X-XSS-Protection, etc.
- **Automatic Updates:** Security patches applied automatically
- **Process Isolation:** PM2 manages processes with resource limits

---

## 📝 Log Locations

### Application Logs
```
/root/GOAT-Royalty-App2/logs/web-error.log
/root/GOAT-Royalty-App2/logs/web-out.log
/root/GOAT-Royalty-App2/logs/automation-error.log
/root/GOAT-Royalty-App2/logs/automation-out.log
/root/GOAT-Royalty-App2/logs/health-check.log
```

### System Logs
```
/var/log/nginx/goat-royalty-access.log
/var/log/nginx/goat-royalty-error.log
```

### View Logs
```bash
# PM2 logs (real-time)
pm2 logs

# Tail specific log
tail -f /root/GOAT-Royalty-App2/logs/web-error.log

# View NGINX logs
tail -f /var/log/nginx/goat-royalty-access.log
```

---

## 🆘 Troubleshooting

### Application Not Starting

```bash
# Check logs
pm2 logs goat-royalty-web --lines 50

# Rebuild application
cd /root/GOAT-Royalty-App2
npm run build
pm2 restart goat-royalty-web
```

### NGINX 502 Bad Gateway

```bash
# Restart application
pm2 restart all

# Restart NGINX
systemctl restart nginx
```

### High Memory Usage

```bash
# Check memory
free -h
pm2 monit

# Restart with memory limit
pm2 restart goat-royalty-web --max-memory-restart 1G
```

For more troubleshooting, see [GOAT-SERVER-SETUP-HOSTINGER.md#troubleshooting](./GOAT-SERVER-SETUP-HOSTINGER.md#troubleshooting)

---

## 🔄 Updates and Maintenance

### Update Application

```bash
cd /root/GOAT-Royalty-App2

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart all
```

### Update System

```bash
# Update packages
apt update && apt upgrade -y

# Reboot if kernel updated
reboot
```

### Maintenance Schedule

- **Daily:** Automatic health checks (configured)
- **Weekly:** Review logs, check for updates
- **Monthly:** System package updates
- **Quarterly:** Security audit

---

## 📞 Support

### Documentation
- **Main Guide:** [GOAT-SERVER-SETUP-HOSTINGER.md](./GOAT-SERVER-SETUP-HOSTINGER.md)
- **Deployment:** [HOSTINGER_DEPLOYMENT_GUIDE.md](./HOSTINGER_DEPLOYMENT_GUIDE.md)
- **Troubleshooting:** See main guide Section 11

### Resources
- **Hostinger Support:** https://www.hostinger.com/tutorials
- **PM2 Docs:** https://pm2.keymetrics.io/docs/
- **NGINX Docs:** https://nginx.org/en/docs/
- **GitHub Issues:** https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/issues

---

## 📌 Quick Reference Card

```bash
# Start everything
pm2 start ecosystem.config.js

# Stop everything
pm2 stop all

# Restart everything
pm2 restart all

# View status
pm2 list

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart NGINX
systemctl restart nginx

# Check firewall
ufw status

# View disk space
df -h

# View memory
free -h
```

---

## ✅ Installation Checklist

After running the setup script or manual installation:

- [ ] SSH access working
- [ ] Node.js 20.x installed
- [ ] NGINX running
- [ ] Firewall configured
- [ ] Repository cloned
- [ ] Environment variables set
- [ ] Application built
- [ ] PM2 processes online
- [ ] Application accessible in browser
- [ ] Health monitoring configured
- [ ] Logs being written
- [ ] All tests passing

---

## 🎉 Success!

If all checks pass, your GOAT Royalty App is successfully deployed and running on Hostinger VPS!

**Next Steps:**
1. Configure SSL certificate (optional)
2. Set up custom domain (optional)
3. Configure AI API keys (optional)
4. Add monitoring dashboards (optional)

---

**Document Version:** 1.0
**Last Updated:** 2026-03-04
**Author:** Harvey Miller / FASTASSMAN Publishing Inc

For detailed information, see [GOAT-SERVER-SETUP-HOSTINGER.md](./GOAT-SERVER-SETUP-HOSTINGER.md)
