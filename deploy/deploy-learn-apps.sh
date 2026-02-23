#!/bin/bash

# Deploy Learning Apps Script
# This script deploys Flask-based learning applications to the VPS

set -e

SERVER="ubuntu@195.35.22.87"
APPS_DIR="/home/ubuntu/apps"

echo "🎓 Deploying Learning Apps..."

# SSH commands to set up and deploy the Flask app
ssh $SERVER << 'ENDSSH'
set -e

APPS_DIR="/home/ubuntu/apps"
MYSQL_LEARN_DIR="$APPS_DIR/sql_learn"

echo "📁 Creating apps directory..."
mkdir -p $APPS_DIR

# Clone or update MySQL Learning app
if [ -d "$MYSQL_LEARN_DIR" ]; then
    echo "📥 Updating MySQL Learning app..."
    cd $MYSQL_LEARN_DIR
    git pull origin main
else
    echo "📥 Cloning MySQL Learning app..."
    cd $APPS_DIR
    git clone https://github.com/Legolasan/sql_learn.git
fi

cd $MYSQL_LEARN_DIR

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
from werkzeug.middleware.dispatcher import DispatcherMiddleware
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
bind = "127.0.0.1:5001"
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
    name: 'mysql-learn',
    script: 'venv/bin/gunicorn',
    args: '-c gunicorn_config.py wsgi:application',
    cwd: '/home/ubuntu/apps/sql_learn',
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
pm2 delete mysql-learn 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "✅ MySQL Learning app deployed on port 5001"
ENDSSH

echo "🔧 Updating Nginx configuration..."

# Update Nginx config for reverse proxy
ssh $SERVER << 'ENDSSH'
set -e

# Add location block for /learn/mysql/ if not exists
NGINX_CONF="/etc/nginx/sites-available/portfolio.conf"

if ! grep -q "location /learn/mysql/" $NGINX_CONF; then
    echo "Adding /learn/mysql/ location to Nginx..."

    # Create a backup
    sudo cp $NGINX_CONF ${NGINX_CONF}.bak

    # Add the location block before the main location / block
    sudo sed -i '/location \/ {/i\
    # MySQL Learning App\
    location /learn/mysql/ {\
        proxy_pass http://127.0.0.1:5001/;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_set_header X-Forwarded-Prefix /learn/mysql;\
        proxy_redirect off;\
    }\
' $NGINX_CONF
else
    echo "Nginx already configured for /learn/mysql/"
fi

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx configured for /learn/mysql/"
ENDSSH

echo ""
echo "✅ Learning apps deployment completed!"
echo "🌐 MySQL Learning available at: https://legolasan.in/learn/mysql/"
