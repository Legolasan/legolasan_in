# Blog CMS Setup Guide

This guide will help you set up the complete blog CMS system on your VPS server.

## Prerequisites

1. PostgreSQL installed on your VPS
2. Node.js 18+ installed
3. OAuth credentials for Google and/or GitHub

## Step 1: Database Setup

### Install PostgreSQL (if not already installed)

```bash
ssh root@195.35.22.87
apt-get update
apt-get install -y postgresql postgresql-contrib
```

### Create Database and User

```bash
sudo -u postgres psql
```

In PostgreSQL prompt:

```sql
CREATE DATABASE portfolio_db;
CREATE USER portfolio_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
\q
```

### Update PostgreSQL Configuration

Edit `/etc/postgresql/*/main/pg_hba.conf` to allow connections:

```
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Restart PostgreSQL:

```bash
systemctl restart postgresql
```

## Step 2: Environment Variables

Create a `.env` file on your server at `/var/www/portfolio/.env`:

```bash
# Database
DATABASE_URL="postgresql://portfolio_user:your_secure_password@localhost:5432/portfolio_db?schema=public"

# NextAuth
NEXTAUTH_URL="https://legolasan.in"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# OAuth - Google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OAuth - GitHub
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Step 3: OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `https://legolasan.in/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: Your Blog CMS
   - Homepage URL: `https://legolasan.in`
   - Authorization callback URL: `https://legolasan.in/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

## Step 4: Database Migrations

After setting up the database and environment variables:

```bash
ssh root@195.35.22.87
cd /var/www/portfolio
npx prisma migrate deploy
```

This will create all necessary tables in the database.

## Step 5: First Admin User

The first user to sign in via OAuth will automatically be assigned the `admin` role. Subsequent users will be assigned the `user` role.

To manually promote a user to admin:

```bash
ssh root@195.35.22.87
sudo -u postgres psql portfolio_db
```

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Step 6: File Permissions

Ensure the uploads directory exists and has proper permissions:

```bash
ssh root@195.35.22.87
cd /var/www/portfolio
mkdir -p public/uploads
chmod 755 public/uploads
```

## Step 7: Deploy

Run the deployment script from your local machine:

```bash
npm run deploy
```

Or manually:

```bash
./deploy/deploy.sh
```

## Step 8: Access Admin Panel

1. Visit `https://legolasan.in/blogs/admin/login`
2. Sign in with Google or GitHub
3. You'll be redirected to the admin dashboard

## Features

### Admin Panel (`/blogs/admin`)

- **Dashboard**: Overview of posts, comments, and statistics
- **Posts**: Create, edit, delete, and manage blog posts
- **Categories & Tags**: Organize content with categories and tags
- **Comments**: Moderate comments (approve/reject/delete)

### Public Blog (`/blogs`)

- **Blog Listing**: Browse all published posts with pagination
- **Search**: Search posts by title, excerpt, or content
- **Categories & Tags**: Filter posts by category or tag
- **Individual Posts**: Read full blog posts with comments
- **Comments**: Visitors can leave comments (moderated)

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql -U portfolio_user -d portfolio_db -h localhost

# Check PostgreSQL is running
systemctl status postgresql
```

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### OAuth Issues

- Verify redirect URIs match exactly
- Check environment variables are set correctly
- Ensure NEXTAUTH_URL matches your domain

### Image Upload Issues

```bash
# Check uploads directory permissions
ls -la public/uploads

# Fix permissions if needed
chmod 755 public/uploads
chown -R www-data:www-data public/uploads
```

## Maintenance

### Backup Database

```bash
pg_dump -U portfolio_user portfolio_db > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql -U portfolio_user portfolio_db < backup_20240101.sql
```

### Update Dependencies

```bash
npm update
npm run deploy
```

## Security Notes

1. Keep your `.env` file secure and never commit it to git
2. Use strong passwords for database users
3. Regularly update dependencies
4. Monitor logs for suspicious activity
5. Use HTTPS (SSL) for all connections
6. Regularly backup your database

