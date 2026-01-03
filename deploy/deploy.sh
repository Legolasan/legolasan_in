#!/bin/bash

# Portfolio Website Deployment Script
# This script deploys the Next.js portfolio to the VPS server

set -e

# Configuration
SERVER="root@195.35.22.87"
REMOTE_DIR="/var/www/portfolio"
LOCAL_DIR="$(pwd)"

echo "🚀 Starting deployment..."

# Check and install Node.js if needed
echo "🔍 Checking Node.js installation..."
if ! ssh $SERVER "command -v node > /dev/null 2>&1"; then
    echo "📦 Node.js not found. Installing Node.js 18.x..."
    ssh $SERVER "curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs"
fi

# Check and install PM2 if needed
if ! ssh $SERVER "command -v pm2 > /dev/null 2>&1"; then
    echo "📦 Installing PM2..."
    ssh $SERVER "npm install -g pm2"
fi

# Check and install Nginx if needed
if ! ssh $SERVER "command -v nginx > /dev/null 2>&1"; then
    echo "📦 Installing Nginx..."
    ssh $SERVER "apt-get update && apt-get install -y nginx"
fi

# Check and install Certbot if needed
echo "🔍 Checking Certbot installation..."
if ! ssh $SERVER "command -v certbot > /dev/null 2>&1"; then
    echo "📦 Installing Certbot..."
    ssh $SERVER "apt-get update && apt-get install -y certbot python3-certbot-nginx"
fi

# Check and install PostgreSQL if needed
echo "🔍 Checking PostgreSQL installation..."
if ! ssh $SERVER "command -v psql > /dev/null 2>&1"; then
    echo "📦 Installing PostgreSQL..."
    ssh $SERVER "apt-get update && apt-get install -y postgresql postgresql-contrib"
    echo "✅ PostgreSQL installed. Please configure database and update DATABASE_URL in .env"
fi

# Build the project
echo "📦 Building the project..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the project
echo "📦 Building the project..."
npm run build

# Create remote directory if it doesn't exist
echo "📁 Creating remote directory..."
ssh $SERVER "mkdir -p $REMOTE_DIR"

# Copy built files to server
echo "📤 Uploading files to server..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'deploy' \
  --exclude '.env' \
  $LOCAL_DIR/ $SERVER:$REMOTE_DIR/

# Copy built .next directory
echo "📤 Uploading build files..."
rsync -avz $LOCAL_DIR/.next/ $SERVER:$REMOTE_DIR/.next/

# Copy .env file if it exists locally (preserve server .env if local doesn't exist)
if [ -f "$LOCAL_DIR/.env" ]; then
    echo "📤 Copying .env file..."
    rsync -avz $LOCAL_DIR/.env $SERVER:$REMOTE_DIR/.env
else
    echo "⚠️  No local .env file found. Preserving server .env if it exists."
fi

# Verify .env file exists on server and has DATABASE_URL
echo "🔍 Verifying .env file on server..."
if ! ssh $SERVER "[ -f $REMOTE_DIR/.env ]"; then
    echo "❌ ERROR: .env file not found on server!"
    echo "   Please create .env file on the server with DATABASE_URL."
    echo "   See BLOG_SETUP_GUIDE.md for instructions."
    exit 1
fi

# Check if DATABASE_URL is set in .env
if ! ssh $SERVER "grep -q '^DATABASE_URL=' $REMOTE_DIR/.env 2>/dev/null"; then
    echo "⚠️  WARNING: DATABASE_URL not found in .env file on server."
    echo "   Please add DATABASE_URL to $REMOTE_DIR/.env on the server."
    echo "   Example: DATABASE_URL=\"postgresql://portfolio_user:password@localhost:5432/portfolio_db?schema=public\""
fi

# Copy node_modules (production only)
echo "📤 Uploading dependencies..."
ssh $SERVER "cd $REMOTE_DIR && npm ci --production"

# Generate Prisma client on server
echo "🔧 Generating Prisma client on server..."
ssh $SERVER "cd $REMOTE_DIR && npx prisma generate"

# Run database migrations
echo "🗄️  Running database migrations..."
ssh $SERVER "cd $REMOTE_DIR && npx prisma migrate deploy" || {
    echo "⚠️  Database migrations failed. This is normal if the database is not set up yet."
    echo "   Please ensure:"
    echo "   1. PostgreSQL is installed and running"
    echo "   2. DATABASE_URL is set correctly in .env file on the server"
    echo "   3. Database exists (create with: createdb portfolio_db)"
    echo "   4. Database user has proper permissions"
    echo "   Then run: ssh $SERVER 'cd $REMOTE_DIR && npx prisma migrate deploy'"
}

# Check if SSL certificate exists
echo "🔐 Checking SSL certificate..."
SSL_EXISTS=$(ssh $SERVER "[ -f /etc/letsencrypt/live/legolasan.in/fullchain.pem ] && echo 'yes' || echo 'no'")

if [ "$SSL_EXISTS" = "no" ]; then
    echo "⚠️  SSL certificate not found. Using HTTP-only configuration..."
    echo "📋 Please ensure DNS is configured correctly:"
    echo "   - legolasan.in → 195.35.22.87"
    echo "   - www.legolasan.in → 195.35.22.87"
    echo ""
    echo "🔍 Verifying DNS..."
    DNS_CHECK=$(ssh $SERVER "dig +short legolasan.in 2>/dev/null | head -1 || echo 'not_resolved'")
    WWW_CHECK=$(ssh $SERVER "dig +short www.legolasan.in 2>/dev/null | head -1 || echo 'not_resolved'")
    
    if [ "$DNS_CHECK" = "195.35.22.87" ] && [ "$WWW_CHECK" = "195.35.22.87" ]; then
        echo "✅ DNS is configured correctly. Setting up SSL certificate..."
        # Use HTTP-only config first
        ssh $SERVER "sudo cp $REMOTE_DIR/nginx/portfolio-http.conf /etc/nginx/sites-available/portfolio.conf"
        ssh $SERVER "sudo nginx -t && sudo systemctl reload nginx"
        
        # Now obtain SSL certificate
        echo "🔐 Obtaining SSL certificate..."
        ssh $SERVER "sudo certbot certonly --nginx -d legolasan.in -d www.legolasan.in --non-interactive --agree-tos --email admin@legolasan.in --redirect" || {
            echo "⚠️  SSL certificate setup failed. Using HTTP-only for now."
            echo "   You can manually set up SSL later with: ./setup-ssl.sh"
        }
        
        # If certificate was obtained, switch to HTTPS config
        if ssh $SERVER "[ -f /etc/letsencrypt/live/legolasan.in/fullchain.pem ]"; then
            echo "✅ SSL certificate obtained! Switching to HTTPS configuration..."
            ssh $SERVER "sudo cp $REMOTE_DIR/nginx/portfolio.conf /etc/nginx/sites-available/portfolio.conf"
        fi
    else
        echo "⚠️  DNS not configured yet. Using HTTP-only configuration."
        echo "   See DNS_SETUP_GUIDE.md for DNS setup instructions"
        echo "   Once DNS is configured, SSL will be set up automatically on next deployment"
        ssh $SERVER "sudo cp $REMOTE_DIR/nginx/portfolio-http.conf /etc/nginx/sites-available/portfolio.conf"
    fi
else
    echo "✅ SSL certificate found. Using HTTPS configuration..."
    ssh $SERVER "sudo cp $REMOTE_DIR/nginx/portfolio.conf /etc/nginx/sites-available/portfolio.conf"
    echo "ℹ️  SSL certificate is configured. Certificate auto-renewal is handled by systemd timer."
fi

# Ensure symlink exists
ssh $SERVER "sudo ln -sf /etc/nginx/sites-available/portfolio.conf /etc/nginx/sites-enabled/portfolio.conf"

# Preserve ip-https config if it exists (for IP-based services)
if ssh $SERVER "[ -f /etc/nginx/sites-available/ip-https ]"; then
    echo "✅ Preserving ip-https configuration for IP-based services..."
    ssh $SERVER "sudo ln -sf /etc/nginx/sites-available/ip-https /etc/nginx/sites-enabled/ip-https"
fi

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
ssh $SERVER "sudo nginx -t"

# Reload Nginx
echo "🔄 Reloading Nginx..."
ssh $SERVER "sudo systemctl reload nginx"

# Start/restart Next.js application (if using PM2 or systemd)
echo "🔄 Starting application..."
if ssh $SERVER "command -v pm2 > /dev/null 2>&1"; then
    echo "Using PM2 to manage the application..."
    ssh $SERVER "cd $REMOTE_DIR && pm2 delete portfolio 2>/dev/null || true"
    ssh $SERVER "cd $REMOTE_DIR && pm2 start npm --name portfolio -- start"
    ssh $SERVER "pm2 save"
else
    echo "PM2 not found. Please install PM2 or configure a systemd service."
    echo "To install PM2: ssh $SERVER 'npm install -g pm2'"
    echo "Or start manually: ssh $SERVER 'cd $REMOTE_DIR && npm start'"
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your portfolio is live at:"
echo "   - https://legolasan.in (primary)"
echo "   - https://www.legolasan.in (redirects to legolasan.in)"
echo "   - http://195.35.22.87 (IP address)"

