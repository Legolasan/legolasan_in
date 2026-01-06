# Security Guide

This document outlines security measures implemented in this portfolio website and instructions for maintaining a secure deployment.

## Environment Variables

### Required Environment Variables

Create a `.env` file with the following variables. **Never commit this file to version control.**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio_db"

# NextAuth (REQUIRED - generate a secure random string)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-a-32-char-random-string-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# OpenAI (for AI Chatbot)
OPENAI_API_KEY="sk-your-openai-api-key"

# EmailJS (for Contact Form)
NEXT_PUBLIC_EMAILJS_SERVICE_ID="your-service-id"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="your-template-id"
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="your-public-key"

# Optional: GitHub Token for higher API rate limits
GITHUB_TOKEN="your-github-personal-access-token"
```

### Generating Secure Secrets

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Server Security

### Securing .env File

On your production server, ensure the `.env` file has restricted permissions:

```bash
# Set ownership to root (or your deploy user)
sudo chown root:root /var/www/portfolio/.env

# Restrict permissions - only owner can read/write
sudo chmod 600 /var/www/portfolio/.env

# Verify permissions
ls -la /var/www/portfolio/.env
# Should show: -rw------- 1 root root
```

### Using PM2 Ecosystem File (Recommended)

Instead of using `.env` directly, you can use PM2's ecosystem file to manage environment variables more securely:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'portfolio',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://...',
      NEXTAUTH_SECRET: '...',
      // ... other variables
    }
  }]
}
```

Then start with:
```bash
pm2 start ecosystem.config.js
```

### Firewall Configuration

Ensure only necessary ports are open:

```bash
# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Database Security

1. **Use a strong password** for your PostgreSQL user
2. **Restrict database access** to localhost only:

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Ensure only local connections are allowed:
# local   all   all   peer
# host    all   all   127.0.0.1/32   scram-sha-256
```

3. **Regular backups**:
```bash
pg_dump portfolio_db > backup_$(date +%Y%m%d).sql
```

## Security Headers

The following security headers are configured in `next.config.js`:

| Header | Purpose |
|--------|---------|
| `Strict-Transport-Security` | Forces HTTPS |
| `X-Content-Type-Options` | Prevents MIME sniffing |
| `X-Frame-Options` | Prevents clickjacking |
| `X-XSS-Protection` | XSS attack prevention |
| `Referrer-Policy` | Controls referrer information |
| `Content-Security-Policy` | Controls resource loading |
| `Permissions-Policy` | Restricts browser features |

## Rate Limiting

API endpoints are protected with rate limiting:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/chat` | 20 requests | 1 minute |
| `/api/analytics/track` | 100 requests | 1 minute |
| `/api/github` | 60 requests | 1 minute |

## Authentication

- OAuth providers (Google, GitHub) handle authentication
- JWT strategy used for session management
- Admin routes protected by middleware
- First user automatically becomes admin

## Input Validation

All user inputs are validated and sanitized:

- Message length limits
- Session ID format validation
- Content sanitization
- SQL injection prevention (via Prisma ORM)

## Regular Security Maintenance

1. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

2. **Monitor logs** for suspicious activity:
   ```bash
   pm2 logs portfolio
   ```

3. **Rotate secrets** periodically (especially `NEXTAUTH_SECRET`)

4. **Review OAuth app permissions** in Google/GitHub settings

5. **SSL certificate renewal** is handled automatically by Certbot

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly by contacting the site owner directly rather than opening a public issue.

