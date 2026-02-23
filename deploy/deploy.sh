#!/bin/bash

# Portfolio Website Deployment Script
# This script deploys the Next.js portfolio from GitHub to the VPS
# Primary deployment is via GitHub Actions, this is a manual fallback

set -e

# Configuration
SERVER="ubuntu@195.35.22.87"
REMOTE_DIR="/var/www/portfolio"
REPO_URL="https://github.com/Legolasan/legolasan_in.git"

echo "🚀 Starting deployment..."

# Check if this is first-time setup or update
REPO_EXISTS=$(ssh $SERVER "[ -d $REMOTE_DIR/.git ] && echo 'yes' || echo 'no'")

if [ "$REPO_EXISTS" = "no" ]; then
    echo "📦 First-time setup: Cloning repository..."

    # Ensure dependencies are installed
    echo "🔍 Checking dependencies..."
    ssh $SERVER << 'ENDSSH'
    # Install Node.js if not present
    if ! command -v node > /dev/null 2>&1; then
        echo "📦 Installing Node.js 18.x..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
        sudo apt-get install -y nodejs
    fi

    # Install PM2 if not present
    if ! command -v pm2 > /dev/null 2>&1; then
        echo "📦 Installing PM2..."
        sudo npm install -g pm2
    fi

    # Install Nginx if not present
    if ! command -v nginx > /dev/null 2>&1; then
        echo "📦 Installing Nginx..."
        sudo apt-get update && sudo apt-get install -y nginx
    fi
ENDSSH

    # Clone the repository
    ssh $SERVER "sudo mkdir -p $REMOTE_DIR && sudo chown -R ubuntu:ubuntu $REMOTE_DIR"
    ssh $SERVER "git clone $REPO_URL $REMOTE_DIR"

    echo "⚠️  IMPORTANT: You need to create .env file on the server!"
    echo "   ssh $SERVER 'nano $REMOTE_DIR/.env'"
    echo "   See .env.example for required variables."
else
    echo "📥 Pulling latest changes from GitHub..."
    ssh $SERVER "cd $REMOTE_DIR && git pull origin main"
fi

# Deploy
echo "📦 Installing dependencies..."
ssh $SERVER "cd $REMOTE_DIR && npm ci"

echo "🔧 Generating Prisma client..."
ssh $SERVER "cd $REMOTE_DIR && npx prisma generate"

echo "🗄️  Running database migrations..."
ssh $SERVER "cd $REMOTE_DIR && npx prisma migrate deploy" || {
    echo "⚠️  Migrations failed. Ensure DATABASE_URL is set in .env"
}

echo "🔨 Building the application..."
ssh $SERVER "cd $REMOTE_DIR && npm run build"

# Restart application
echo "🔄 Restarting application..."
if ssh $SERVER "pm2 list | grep -q portfolio"; then
    ssh $SERVER "pm2 restart portfolio --update-env"
else
    ssh $SERVER "cd $REMOTE_DIR && pm2 start npm --name portfolio -- start"
fi
ssh $SERVER "pm2 save"

# Health check
echo "🔍 Running health check..."
sleep 3
HEALTH=$(ssh $SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 || echo '000'")

if [ "$HEALTH" = "200" ]; then
    echo "✅ Deployment successful!"
else
    echo "⚠️  Health check returned: $HEALTH"
    echo "   Check logs: ssh $SERVER 'pm2 logs portfolio'"
fi

echo ""
echo "🌐 Your portfolio is live at:"
echo "   - https://legolasan.in"
echo "   - https://www.legolasan.in"
