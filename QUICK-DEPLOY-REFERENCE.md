# 🚀 Quick Deploy Reference Card

## 📦 Deployment Package Ready
**Location**: `/workspace/GOAT-Royalty-App2/goat-app-deployment.tar.gz`
**Size**: 5.3MB

## 🔑 Your Credentials

> **SECURITY NOTE:** Do not commit real credentials to version control.
> Store all secrets in `.env.local` (which is git-ignored).

### Hostinger API
```
API Key: <set HOSTINGER_API_TOKEN in .env.local>
```

### Supabase Database
```
URL: <set NEXT_PUBLIC_SUPABASE_URL in .env.local>
Anon Key: <set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local>
```

## ⚡ Quick Deploy Commands

### 1. Upload to VPS
```bash
scp goat-app-deployment.tar.gz root@YOUR-VPS-IP:/root/
```

### 2. SSH into VPS
```bash
ssh root@YOUR-VPS-IP
```

### 3. One-Line Setup
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt install -y nodejs nginx && \
sudo npm install -g pm2 && \
sudo mkdir -p /var/www/goat-app && \
cd /root && tar -xzf goat-app-deployment.tar.gz -C /var/www/goat-app && \
cd /var/www/goat-app && npm install --production && npm run build && \
pm2 start npm --name "goat-app" -- start && pm2 save && pm2 startup
```

### 4. Configure Nginx
```bash
sudo tee /etc/nginx/sites-available/goat-app << 'EOF'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/goat-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

### 5. Enable Firewall
```bash
sudo ufw allow 'Nginx Full' && sudo ufw allow OpenSSH && sudo ufw --force enable
```

## 🔍 Quick Checks

### Is app running?
```bash
pm2 status
curl http://localhost:3000
```

### View logs
```bash
pm2 logs goat-app --lines 50
```

### Restart app
```bash
pm2 restart goat-app
```

## 🌐 Access Your App

- **Local**: http://localhost:3000 (from VPS)
- **Public**: http://YOUR-VPS-IP
- **Domain**: http://your-domain.com (after DNS setup)

## 📱 Hostinger hPanel

**Access**: https://hpanel.hostinger.com

**Steps**:
1. Login
2. Go to VPS section
3. Make sure VPS is running
4. Use File Manager to upload package
5. Use SSH terminal to run commands

## 🆘 Emergency Commands

### Stop app
```bash
pm2 stop goat-app
```

### Delete app
```bash
pm2 delete goat-app
```

### Check what's using port 3000
```bash
sudo lsof -i :3000
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### View Nginx errors
```bash
sudo tail -f /var/log/nginx/error.log
```

## 📊 Monitoring

```bash
# Real-time monitoring
pm2 monit

# System resources
htop

# Disk space
df -h

# Memory usage
free -h
```

## 🔄 Update App

```bash
# Stop app
pm2 stop goat-app

# Backup
cd /var/www && mv goat-app goat-app-backup

# Extract new version
mkdir goat-app
tar -xzf /root/goat-app-deployment.tar.gz -C /var/www/goat-app

# Rebuild
cd /var/www/goat-app
npm install --production
npm run build

# Restart
pm2 restart goat-app
```

## ✅ Success Indicators

- ✅ `pm2 status` shows "online"
- ✅ `curl http://localhost:3000` returns HTML
- ✅ Browser shows app at http://YOUR-VPS-IP
- ✅ No errors in `pm2 logs goat-app`

## 📞 Get Help

- Full Guide: `HOSTINGER-DEPLOYMENT-COMPLETE.md`
- Hostinger Support: https://www.hostinger.com/contact
- GitHub: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2

---

**Estimated Time**: 15-30 minutes for complete deployment