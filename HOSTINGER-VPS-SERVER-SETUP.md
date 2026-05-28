# GOAT Royalty App — Hostinger VPS Server Setup (API Token Ready)

Use this playbook to bring up the GOAT Royalty server on Hostinger VPS using the provided API token and the existing deployment scripts in this repo.

## API token and env setup
- Hostinger API token (provided): `iLI2v04ps7OujaQVenlyBMgsPwwkGcxr44J9HGSp7cdf1e6e`
- Set it for your shell or CI before calling the scripts:
  ```bash
  export HOSTINGER_API_TOKEN=iLI2v04ps7OujaQVenlyBMgsPwwkGcxr44J9HGSp7cdf1e6e
  export HOSTINGER_HOST=<your-vps-host-or-ip>
  export HOSTINGER_USERNAME=<ssh-user>   # usually root
  export HOSTINGER_DOMAIN=<your-domain>  # optional, for health check
  export DEPLOY_PATH=~/public_html       # adjust if you deploy elsewhere
  ```
- Keep the token in secrets for CI/hPanel; do not paste it into public chats.

## Fast path: use the generated uploader
1. Install deps locally and build once:
   ```bash
   npm install
   npm run build
   ```
2. Run the Hostinger deploy helper to create the upload script and package:
   ```bash
   node deploy-hostinger.js
   ```
   This produces `goat-royalty-app.tar.gz` and `upload-to-hostinger.sh`.
3. Upload and deploy to the VPS:
   ```bash
   ./upload-to-hostinger.sh
   ```
   The script backs up the current app, installs production deps, applies permissions, restarts via PM2, and runs a health check against `HOSTINGER_DOMAIN`.
4. Verify on the server:
   ```bash
   pm2 logs goat-royalty-app
   curl -I https://$HOSTINGER_DOMAIN || curl -I http://$HOSTINGER_HOST:3000
   ```

## Manual bootstrap on a fresh VPS
SSH into the VPS (`ssh root@$HOSTINGER_HOST`) and run:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx ufw build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Deploy the app:
```bash
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git /var/www/goat-royalty-app
cd /var/www/goat-royalty-app
cp .env.local.example .env.local 2>/dev/null || touch .env.local  # fill with Supabase/Google/Twilio keys and NEXT_PUBLIC_APP_URL
npm install --production=false
npm run build
pm2 start npm --name goat-royalty-app -- start -- -p 3000
pm2 save
```

Nginx reverse proxy:
```bash
sudo tee /etc/nginx/sites-available/goat-royalty-app <<'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/goat-royalty-app /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

Validation checks:
```bash
pm2 status goat-royalty-app
sudo nginx -t && sudo systemctl status nginx --no-pager
curl -I https://YOUR_DOMAIN || curl -I http://$HOSTINGER_HOST:3000
```

Optional: secure with TLS
```bash
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
sudo ufw allow 'Nginx Full' && sudo ufw allow OpenSSH && sudo ufw enable
```
