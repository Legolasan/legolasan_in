# Stats Dashboard Setup Guide

This guide explains how to set up the stats.legolasan.in subdomain for your nerdy stats dashboard.

## Prerequisites

- DNS A record for `stats.legolasan.in` pointing to your VPS IP (195.35.22.87) ✅ **DONE**
- Admin access to the VPS
- SSL certificate for stats.legolasan.in

## Step 1: Run Database Migration

First, create the new database tables for deployment logs and API metrics:

```bash
# On your local machine
npm run prisma:migrate

# When prompted for migration name, use:
# "add_stats_monitoring_tables"
```

This will create the `deployment_logs` and `api_metrics` tables.

## Step 2: Update Nginx Configuration

Add the following server block to `/etc/nginx/sites-available/portfolio.conf` on your VPS:

```nginx
# Stats Subdomain - Redirect to stats route
server {
    listen 80;
    listen [::]:80;
    server_name stats.legolasan.in;

    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://stats.legolasan.in$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stats.legolasan.in;

    # SSL Certificate (same as main domain)
    ssl_certificate /etc/letsencrypt/live/legolasan.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/legolasan.in/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rewrite to stats route while maintaining session cookies
    location / {
        # Rewrite stats.legolasan.in to legolasan.in/stats
        rewrite ^(.*)$ /stats$1 break;

        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host legolasan.in;  # Use main domain for session cookies
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Original-Host stats.legolasan.in;
        proxy_cache_bypass $http_upgrade;

        # Prevent caching
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }
}
```

## Step 3: Update SSL Certificate

If your current SSL certificate doesn't include stats.legolasan.in, update it:

```bash
# On VPS as root
sudo certbot certonly --nginx -d legolasan.in -d www.legolasan.in -d stats.legolasan.in

# Or expand existing certificate
sudo certbot --expand -d legolasan.in -d www.legolasan.in -d stats.legolasan.in
```

## Step 4: Test and Reload Nginx

```bash
# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

## Step 5: Deploy the Code

```bash
# On your local machine - commit and push
git add .
git commit -m "Add nerdy stats dashboard with terminal theme"
git push

# Auto-deploy will run within 2 minutes
# Or manually deploy:
./deploy/deploy.sh
```

## Step 6: Verify Setup

1. Visit https://stats.legolasan.in
2. Login with admin credentials
3. Check that all metrics are displaying:
   - System resources (CPU, Memory, Disk)
   - PM2 processes
   - Service health
   - Endpoint health

## Features

### Terminal Theme
- Dark background (#0a0e27) with neon green (#00ff41) accents
- Monospace fonts (font-mono)
- ASCII box-drawing characters
- Matrix-style aesthetics

### Auto-Refresh
- Refreshes every 5 seconds by default
- Toggle button to pause/resume
- Shows last update timestamp

### Metrics Displayed
1. **System Resources**: CPU usage, Memory usage, Disk usage
2. **PM2 Processes**: Status, CPU, Memory, Uptime, Restart count
3. **System Services**: Nginx, PostgreSQL, MariaDB status
4. **Endpoint Health**: HTTP health checks with response times

### API Endpoints Created
- `/api/stats/system` - System resources (CPU, memory, disk, uptime)
- `/api/stats/pm2` - PM2 process monitoring
- `/api/stats/services` - Service health checks

### Security
- Admin-only access (requires NextAuth admin role)
- Rate limiting (30 requests/minute)
- 5-second caching to avoid hammering system
- All API routes protected

## Troubleshooting

### Stats page shows "Loading..."
- Check if you're logged in as admin
- Check browser console for API errors
- Verify `/api/stats/*` endpoints are accessible

### PM2 processes not showing
- Verify PM2 is installed: `pm2 --version`
- Check PM2 is running: `pm2 list`
- Ensure the API can execute `pm2 jlist` command

### Service status shows "unknown"
- Verify systemctl is accessible
- Check service names are correct: `systemctl status nginx`

### SSL certificate errors
- Ensure stats.legolasan.in is in your SSL certificate
- Run: `sudo certbot certificates` to check domains

## Future Enhancements

Ideas for v2:
- Historical charts (CPU/memory trends over time)
- Deployment history from logs
- Database connection pool stats
- Real-time log streaming
- Alert system (email/Slack on process failures)
- Docker container stats for unix-learn
- API performance metrics tracking

## Notes

- The stats page is admin-only by default
- All metrics are cached (2-30 seconds) to reduce system load
- Auto-refresh can be toggled to reduce API calls
- The terminal theme uses monospace fonts for authentic look
