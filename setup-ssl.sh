#!/bin/bash

# Manual SSL Setup Script
# Use this if you want to set up SSL manually or if automatic setup fails

set -e

SERVER="root@XXX.XX.XX.XX"
DOMAIN="legolasan.in"

echo "🔐 SSL Certificate Setup for $DOMAIN"
echo ""

# Check if Certbot is installed
echo "🔍 Checking Certbot..."
if ! ssh $SERVER "command -v certbot > /dev/null 2>&1"; then
    echo "📦 Installing Certbot..."
    ssh $SERVER "apt-get update && apt-get install -y certbot python3-certbot-nginx"
fi

# Verify DNS
echo "🔍 Verifying DNS configuration..."
LEGALASAN_IP=$(ssh $SERVER "dig +short legolasan.in | head -1")
WWW_IP=$(ssh $SERVER "dig +short www.legolasan.in | head -1")

if [ "$LEGALASAN_IP" != "XXX.XX.XX.XX" ] || [ "$WWW_IP" != "XXX.XX.XX.XX" ]; then
    echo "❌ DNS not configured correctly!"
    echo "   legolasan.in resolves to: $LEGALASAN_IP (expected: XXX.XX.XX.XX)"
    echo "   www.legolasan.in resolves to: $WWW_IP (expected: XXX.XX.XX.XX)"
    echo ""
    echo "Please configure DNS first. See DNS_SETUP_GUIDE.md for instructions."
    exit 1
fi

echo "✅ DNS is configured correctly!"
echo ""

# Check if certificate already exists
if ssh $SERVER "[ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]"; then
    echo "⚠️  SSL certificate already exists for $DOMAIN"
    read -p "Do you want to renew it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Renewing certificate..."
        ssh $SERVER "sudo certbot renew"
    else
        echo "ℹ️  Keeping existing certificate"
        exit 0
    fi
else
    echo "📋 Obtaining SSL certificate..."
    echo "   This will require your email address for Let's Encrypt notifications"
    echo ""
    
    # Get email from user or use default
    read -p "Enter email address for SSL certificate (or press Enter for admin@legolasan.in): " EMAIL
    EMAIL=${EMAIL:-admin@legolasan.in}
    
    echo "🔐 Obtaining certificate for $DOMAIN and www.$DOMAIN..."
    ssh $SERVER "sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect"
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL certificate obtained successfully!"
        echo "🔄 Reloading Nginx..."
        ssh $SERVER "sudo systemctl reload nginx"
        echo "✅ Setup complete! Your site should now be accessible at https://$DOMAIN"
    else
        echo "❌ Failed to obtain SSL certificate"
        echo "   Please check:"
        echo "   1. DNS is correctly configured"
        echo "   2. Ports 80 and 443 are open in firewall"
        echo "   3. Nginx is running"
        exit 1
    fi
fi

# Set up auto-renewal
echo ""
echo "🔄 Setting up automatic certificate renewal..."
ssh $SERVER "sudo systemctl enable certbot.timer"
ssh $SERVER "sudo systemctl start certbot.timer"
echo "✅ Auto-renewal configured (certificates renew automatically)"

echo ""
echo "✅ SSL setup complete!"
echo "🌐 Your site is now available at:"
echo "   - https://$DOMAIN"
echo "   - https://www.$DOMAIN (redirects to $DOMAIN)"

