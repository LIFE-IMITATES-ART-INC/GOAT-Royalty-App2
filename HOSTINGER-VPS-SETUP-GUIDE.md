# 🐐 GOAT Royalty App — Hostinger VPS Setup Guide

Complete step-by-step guide for setting up the GOAT Royalty App on a Hostinger VPS using the Hostinger API.

---

## 📋 Prerequisites

Before starting, ensure you have:

- A [Hostinger](https://www.hostinger.com) account with an active VPS plan
- Your **Hostinger API token** (obtain from hPanel → Account → API Access)
- SSH access to your VPS (username and root password from hPanel)
- The GOAT Royalty App repository access: `DJSPEEDYGA/GOAT-Royalty-App2`

> **Security:** Never commit or share your API token. Store it as a GitHub Secret
> (`HOSTINGER_API_TOKEN`) or in an environment variable.

---

## 🔑 Step 1: Obtain Your Hostinger API Token

1. Log in to [hPanel](https://hpanel.hostinger.com)
2. Click your profile icon → **Profile**
3. Navigate to **API Access** (or **Developer Tools**)
4. Click **Generate New Token**
5. Copy the token and store it securely

Set it as an environment variable for all subsequent steps:

```bash
export HOSTINGER_API_TOKEN=your-hostinger-api-token-here
```

Or store it as a GitHub repository secret:
- Go to **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret**
- Name: `HOSTINGER_API_TOKEN`, Value: your token

---

## 🖥️ Step 2: Provision / Verify Your VPS

### Get VPS Details from hPanel

1. Go to [hPanel](https://hpanel.hostinger.com) → **VPS**
2. Note your VPS details:

| Field          | Value                       |
|----------------|-----------------------------|
| IP Address     | e.g. `93.127.214.171`       |
| SSH Username   | `root`                      |
| SSH Password   | (set in hPanel or via email)|
| OS             | Ubuntu 22.04 / 24.04        |

3. Make sure the VPS status shows **Running**

### Verify API Access

```bash
curl -s -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  https://api.hostinger.com/v1/vps \
  | python3 -m json.tool
```

Expected: a JSON list of your VPS instances.

---

## 🚀 Step 3: One-Command Server Setup (Recommended)

Once you have SSH access, run the automated deployment script:

```bash
# Upload the deploy script to your VPS
scp deploy-hostinger.sh root@YOUR-VPS-IP:/root/

# SSH into your VPS
ssh root@YOUR-VPS-IP

# Run the deployment (takes ~20 minutes)
chmod +x /root/deploy-hostinger.sh
/root/deploy-hostinger.sh
```

The script will automatically:
- Update system packages
- Install Node.js 20.x and npm
- Install PM2 (process manager)
- Install and configure Nginx
- Clone the application from GitHub
- Install application dependencies
- Build the Next.js application
- Configure PM2 for auto-restart
- Set up the firewall (UFW)
- Optionally install an SSL certificate (if `DOMAIN` is configured)

---

## 🔧 Step 4: Manual Server Setup

If you prefer to set up the server manually, follow these steps.

### 4.1 — Connect to the VPS

```bash
ssh root@YOUR-VPS-IP
```

### 4.2 — Update System Packages

```bash
sudo apt update -y && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx ufw build-essential
```

### 4.3 — Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version   # v20.x
npm --version    # 10.x
```

### 4.4 — Install PM2

```bash
sudo npm install -g pm2
pm2 startup systemd -u root --hp /root
```

### 4.5 — Clone the Application

```bash
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git /var/www/goat-app
cd /var/www/goat-app
```

### 4.6 — Configure Environment Variables

```bash
cp .env.example .env.local   # if example exists, otherwise create new
nano /var/www/goat-app/.env.local
```

Fill in the following values:

```bash
# ── Supabase ──────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ── Google AI (Gemini) ────────────────────────────────────────
GOOGLE_AI_API_KEY=your-google-ai-api-key

# ── App Config ────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://YOUR-VPS-IP-OR-DOMAIN
NODE_ENV=production
PORT=3002
```

### 4.7 — Install Dependencies and Build

```bash
cd /var/www/goat-app
npm install
npm run build
```

### 4.8 — Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### 4.9 — Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/goat-royalty-app > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;           # Replace _ with your domain if available

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3002;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    client_max_body_size 50M;
}
EOF

sudo ln -sf /etc/nginx/sites-available/goat-royalty-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 4.10 — Configure Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable
sudo ufw status
```

### 4.11 — (Optional) Enable HTTPS with Let's Encrypt

If you have a domain name pointed at this VPS:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🤖 Step 5: Automated Deployment via GitHub Actions

For continuous delivery on every push to `main`, configure the pre-built workflow.

### Add GitHub Secrets

In your repository: **Settings → Secrets and variables → Actions**

| Secret Name          | Value                                    |
|----------------------|------------------------------------------|
| `HOSTINGER_HOST`     | Your VPS IP address                      |
| `HOSTINGER_USERNAME` | `root` (or your SSH user)               |
| `HOSTINGER_SSH_KEY`  | Contents of your SSH private key         |
| `HOSTINGER_URL`      | `http://YOUR-VPS-IP` or `https://domain`|

The workflow file `.github/workflows/deploy-hostinger.yml` is already configured and will trigger on every push to `main`.

---

## ✅ Step 6: Verification

After setup, verify everything is working:

```bash
# On the VPS — check app is running
pm2 status
pm2 logs goat-royalty-app --lines 20

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check app responds locally
curl http://localhost:3002

# Check app is accessible from outside
curl http://YOUR-VPS-IP
```

Open `http://YOUR-VPS-IP` in a browser — you should see the GOAT Royalty App login page.

---

## 🔄 Updating the Application

```bash
# On the VPS
cd /var/www/goat-app
git pull origin main
npm install
npm run build
pm2 restart goat-royalty-app
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | `pm2 logs goat-royalty-app --lines 50` — look for errors |
| Port 3002 in use | `sudo lsof -i :3002` → kill conflicting process |
| 502 Bad Gateway | Verify app is running: `pm2 status`; restart: `pm2 restart goat-royalty-app` |
| Nginx fails to start | `sudo nginx -t` for config errors; check `sudo tail /var/log/nginx/error.log` |
| Database errors | Verify `.env.local` has correct Supabase credentials |
| Can't reach site | `sudo ufw status` — ensure ports 80/443 are open |

---

## 📊 Useful Commands Reference

```bash
# PM2
pm2 status                      # Check all processes
pm2 logs goat-royalty-app       # Stream logs
pm2 restart goat-royalty-app    # Restart app
pm2 monit                       # Interactive monitor

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log

# System
htop                            # Resource monitor (install: sudo apt install htop)
df -h                           # Disk usage
free -h                         # Memory usage
```

---

## 🔐 Security Checklist

- [ ] API token stored as environment variable or GitHub Secret — never hardcoded
- [ ] SSH password changed from default or key-based auth enabled
- [ ] Firewall configured (UFW)
- [ ] SSL certificate installed (HTTPS)
- [ ] `.env.local` not committed to version control (already in `.gitignore`)
- [ ] PM2 configured to run as non-root user (recommended for production)

---

*© 2026 Harvey Miller / FASTASSMAN Publishing Inc*
