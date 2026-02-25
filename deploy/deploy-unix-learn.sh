#!/bin/bash

# Deploy Unix & Networking Learning App Script
# This script deploys the Unix learning Flask application to the VPS

set -e

SERVER="ubuntu@195.35.22.87"
APPS_DIR="/home/ubuntu/apps"

echo "🐧 Deploying Unix & Networking Learning App..."

# SSH commands to set up and deploy the Flask app
ssh $SERVER << 'ENDSSH'
set -e

APPS_DIR="/home/ubuntu/apps"
UNIX_LEARN_DIR="$APPS_DIR/unix_networking"

echo "📁 Creating apps directory..."
mkdir -p $APPS_DIR

# Clone or update Unix Learning app
if [ -d "$UNIX_LEARN_DIR" ]; then
    echo "📥 Updating Unix Learning app..."
    cd $UNIX_LEARN_DIR
    git pull origin main
else
    echo "📥 Cloning Unix Learning app..."
    cd $APPS_DIR
    git clone https://github.com/Legolasan/unix_networking.git
fi

cd $UNIX_LEARN_DIR

# Build the Docker sandbox image
echo "🐳 Building Docker sandbox image..."
if [ -f "Dockerfile" ]; then
    docker build -t linux-sandbox:latest .
else
    echo "⚠️ No Dockerfile found, skipping Docker image build"
fi

# Set up Python virtual environment
echo "🐍 Setting up Python environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn werkzeug

# Create WSGI wrapper for URL prefix handling
echo "⚙️ Creating WSGI wrapper..."
cat > wsgi.py << 'EOF'
from werkzeug.middleware.proxy_fix import ProxyFix
from app import create_app

app = create_app()

# Handle proxy headers (X-Forwarded-For, X-Forwarded-Proto, etc.)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# This is the WSGI application entry point
application = app
EOF

# Create Gunicorn config
echo "⚙️ Creating Gunicorn config..."
cat > gunicorn_config.py << 'EOF'
bind = "127.0.0.1:5002"
workers = 2
threads = 2
worker_class = "sync"
timeout = 120
keepalive = 5
errorlog = "-"
accesslog = "-"
loglevel = "info"
EOF

# Create PM2 ecosystem file
echo "📦 Creating PM2 config..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'unix-learn',
    script: 'venv/bin/gunicorn',
    args: '-c gunicorn_config.py wsgi:application',
    cwd: '/home/ubuntu/apps/unix_networking',
    interpreter: 'none',
    env: {
      FLASK_ENV: 'production',
      SECRET_KEY: 'prod-secret-key-change-this'
    }
  }]
}
EOF

# Start or restart with PM2
echo "🚀 Starting with PM2..."
pm2 delete unix-learn 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "✅ Unix Learning app deployed on port 5002"
ENDSSH

echo "🔧 Updating Nginx configuration..."

# Update Nginx config for reverse proxy
ssh $SERVER << 'ENDSSH'
set -e

# Add location block for /learn/unix/ if not exists
NGINX_CONF="/etc/nginx/sites-available/portfolio.conf"

if ! grep -q "location /learn/unix/" $NGINX_CONF; then
    echo "Adding /learn/unix/ location to Nginx..."

    # Create a backup
    sudo cp $NGINX_CONF ${NGINX_CONF}.bak

    # Add the location block before the main location / block
    sudo sed -i '/location \/ {/i\
    # Unix & Networking Learning App\
    location /learn/unix/ {\
        proxy_pass http://127.0.0.1:5002/;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_set_header X-Forwarded-Prefix /learn/unix;\
        proxy_redirect off;\
    }\
' $NGINX_CONF
else
    echo "Nginx already configured for /learn/unix/"
fi

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx configured for /learn/unix/"
ENDSSH

echo "🔄 Setting up auto-deploy cron job..."

# Create auto-deploy script on VPS
ssh $SERVER << 'ENDSSH'
cat > /home/ubuntu/auto-deploy-unix-learn.sh << 'EOF'
#!/bin/bash
# Auto-deploy Unix Learning app when GitHub changes detected

REPO_DIR="/home/ubuntu/apps/unix_networking"
LOG_FILE="/home/ubuntu/deploy-unix.log"

cd $REPO_DIR 2>/dev/null || exit 0

# Fetch latest from GitHub
git fetch origin main --quiet

# Check if there are new commits
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "$(date): New commits detected, deploying..." >> $LOG_FILE
    git pull origin main >> $LOG_FILE 2>&1

    # Rebuild Docker image if Dockerfile changed
    if git diff --name-only HEAD~1 | grep -q "Dockerfile"; then
        echo "$(date): Rebuilding Docker image..." >> $LOG_FILE
        docker build -t linux-sandbox:latest . >> $LOG_FILE 2>&1
    fi

    # Reinstall dependencies if requirements.txt changed
    if git diff --name-only HEAD~1 | grep -q "requirements.txt"; then
        echo "$(date): Updating dependencies..." >> $LOG_FILE
        source venv/bin/activate
        pip install -r requirements.txt >> $LOG_FILE 2>&1
    fi

    # Restart the app
    pm2 restart unix-learn >> $LOG_FILE 2>&1
    echo "$(date): Deploy complete!" >> $LOG_FILE
fi
EOF
chmod +x /home/ubuntu/auto-deploy-unix-learn.sh

# Add cron job if not exists
if ! crontab -l 2>/dev/null | grep -q "auto-deploy-unix-learn.sh"; then
    (crontab -l 2>/dev/null; echo "*/2 * * * * /home/ubuntu/auto-deploy-unix-learn.sh") | crontab -
    echo "✅ Cron job added for auto-deploy"
else
    echo "Cron job already exists"
fi
ENDSSH

echo ""
echo "✅ Unix & Networking Learning app deployment completed!"
echo "🌐 Available at: https://legolasan.in/learn/unix/"
