# Domain Setup - Implementation Complete ✅

## What's Been Done

1. ✅ **Nginx Configuration Updated**
   - Created HTTPS configuration for `legalasan.in` and `www.legalasan.in`
   - Set up HTTP to HTTPS redirect
   - Configured www to non-www redirect
   - Added security headers

2. ✅ **Deployment Script Enhanced**
   - Automatically detects if SSL certificate exists
   - Uses HTTP-only config if SSL not available
   - Automatically sets up SSL when DNS is ready
   - Installs Certbot if needed

3. ✅ **SSL Setup Script Created**
   - Manual SSL setup script: `setup-ssl.sh`
   - Can be used if automatic setup fails

4. ✅ **DNS Setup Guide Created**
   - Step-by-step instructions in `DNS_SETUP_GUIDE.md`

## Current Status

- ✅ Website is running on HTTP (http://195.35.22.87)
- ⏳ Waiting for DNS configuration
- ⏳ SSL will be set up automatically once DNS is configured

## Next Steps

### Step 1: Configure DNS (REQUIRED)

Follow the instructions in `DNS_SETUP_GUIDE.md` to:
1. Add A record: `legalasan.in` → `195.35.22.87`
2. Add A record: `www.legalasan.in` → `195.35.22.87`

### Step 2: Verify DNS Propagation

Wait for DNS to propagate (usually 1-2 hours, can take up to 48 hours).

Check DNS:
```bash
dig legalasan.in +short
dig www.legalasan.in +short
```

Both should return: `195.35.22.87`

### Step 3: Deploy Again (Automatic SSL Setup)

Once DNS is configured, simply run:
```bash
npm run deploy
```

The deployment script will:
- Detect that DNS is configured
- Automatically obtain SSL certificate
- Switch to HTTPS configuration
- Your site will be live at https://legalasan.in!

### Alternative: Manual SSL Setup

If you prefer to set up SSL manually:
```bash
./setup-ssl.sh
```

## After SSL is Set Up

Your website will be accessible at:
- ✅ **https://legalasan.in** (primary, secure)
- ✅ **https://www.legalasan.in** (redirects to legalasan.in)
- ✅ **http://legalasan.in** (redirects to HTTPS)
- ✅ **http://www.legalasan.in** (redirects to HTTPS)

## SSL Certificate Auto-Renewal

SSL certificates are automatically renewed via Certbot timer. No action needed!

## Troubleshooting

**DNS not resolving?**
- Wait longer (up to 48 hours)
- Check DNS records are correct
- Verify with: `dig legalasan.in +short`

**SSL setup fails?**
- Ensure DNS is fully propagated
- Check ports 80 and 443 are open
- Run manual setup: `./setup-ssl.sh`

**Need help?**
- Check `DNS_SETUP_GUIDE.md` for DNS instructions
- Check `setup-ssl.sh` for manual SSL setup

## Summary

Everything is ready! Just configure DNS and deploy again. The SSL certificate will be set up automatically. 🚀

