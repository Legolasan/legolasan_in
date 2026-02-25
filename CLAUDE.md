# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Next.js 14 portfolio website with AI chatbot, blog system, and analytics. Deployed to Ubuntu VPS at https://legolasan.in.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth.js (Google/GitHub OAuth), OpenAI GPT-4o-mini

## Commands

```bash
npm run dev              # Start dev server on :3000
npm run build            # Build (includes prisma generate)
npm run lint             # ESLint
npm run prisma:migrate   # Run migrations (dev mode)
npm run prisma:studio    # Open Prisma UI at :5555

# Deployment (auto via cron pull every 2 min)
git push                 # VPS auto-pulls and rebuilds within 2 min
./deploy/deploy.sh       # Manual deploy for immediate updates
```

## Architecture

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes (auth, blogs, chat, analytics, etc.)
│   ├── admin/          # General admin panel (analytics, chats, resumes)
│   ├── blogs/[slug]/   # Dynamic blog pages
│   ├── blogs/admin/    # Blog-specific admin (posts, categories, comments)
│   ├── tools/          # Tools showcase page
│   └── page.tsx        # Homepage with all portfolio sections
├── components/         # React components (Hero, ChatBot, BlogSection, etc.)
├── lib/
│   ├── data.ts         # Static content (projects, experience, skills, tools)
│   ├── auth.ts         # NextAuth config with JWT strategy
│   ├── db.ts           # Prisma singleton
│   ├── geoLookup.ts    # IP geolocation using ip-api.com
│   ├── rateLimit.ts    # In-memory rate limiting
│   └── queries/        # Reusable Prisma queries
├── context/            # ThemeContext (dark/light mode)
└── middleware.ts       # Route protection for /admin/* and /blogs/admin/*
```

## Admin Routes

- `/admin/` - General admin dashboard (analytics, chat logs, resume downloads)
- `/admin/login` - Shared login page for all admin areas
- `/admin/analytics` - Page views with world map visualization
- `/admin/chats` - AI chatbot conversation logs
- `/admin/resumes` - Resume download tracking
- `/blogs/admin/` - Blog-specific admin (posts, categories, tags, comments)

Note: `/blogs/admin/login` redirects to `/admin/login` for unified authentication.

## Learning Hub

- `/learn` - Landing page with learning module cards (extensible - add modules to `learningModules` array in `data.ts`)
- `/learn/mysql/` - MySQL Learning Flask app (reverse proxied from port 5001)
- `/learn/unix/` - Unix & Networking Learning Flask app (reverse proxied from port 5002, requires Docker)

### Adding New Learning Modules

1. Add a new `LearningModule` entry in `src/lib/data.ts`
2. For external Flask apps, create a deployment script in `deploy/` and add Nginx reverse proxy config

### Flask App Deployment Architecture

```
Learning Apps (Flask + Gunicorn + PM2)
├── /home/ubuntu/apps/sql_learn/        # MySQL Learning app (port 5001)
├── /home/ubuntu/apps/unix_networking/  # Unix Learning app (port 5002, uses Docker)
│   ├── venv/                           # Python virtual environment
│   ├── wsgi.py                         # WSGI wrapper with ProxyFix
│   ├── gunicorn_config.py              # Gunicorn config
│   └── ecosystem.config.js             # PM2 config
```

**Deploy learning apps:**
- `./deploy/deploy-learn-apps.sh` - MySQL Learning
- `./deploy/deploy-unix-learn.sh` - Unix & Networking Learning

PM2 processes:
- `mysql-learn` → port 5001 → `/learn/mysql/`
- `unix-learn` → port 5002 → `/learn/unix/`

### URL Prefix Handling

Flask apps served under a subpath need proper URL generation:
1. Nginx sends `X-Forwarded-Prefix` header
2. WSGI wrapper uses `ProxyFix(app.wsgi_app, x_prefix=1)`
3. Templates must use `url_for()` instead of hardcoded URLs

## Key Patterns

- **"use client"** directive required for interactive components (hooks, state, browser APIs)
- **Framer Motion** for animations throughout
- **Path alias:** `@/*` maps to `./src/*`
- **Static content:** Edit `src/lib/data.ts` for portfolio updates (projects, experience, skills, tools)
- **Experience backup:** `src/lib/data.backup.ts` contains the original separate Technical Operations Manager + Product Support Manager roles. To restore, replace the merged entry in `data.ts` with the two entries from the backup file.
- **Role-based auth:** First OAuth user auto-becomes admin; middleware protects `/admin/*` and `/blogs/admin/*`
- **Geo-tracking:** IP geolocation via ip-api.com (free, 45 req/min, 24-hour caching). World map uses react-simple-maps with coordinates derived from city names.
- **CSP Headers:** Configured in `next.config.js`. Add external domains to `connect-src` when needed (e.g., cdn.jsdelivr.net for map data).
- **Rate limiting:** Use `rateLimiters.chat`, `.standard`, `.strict`, `.relaxed`, `.analytics` from `rateLimit.ts`. Get client IP with `getClientIP(request)`.
- **Chat API:** SSE streaming with OpenAI, 10 questions/session, 20 questions/IP/day. Uses `ReadableStream` for real-time responses.
- **Google Analytics 4:** Measurement ID `G-0R0F7W8JC4`. Configured in `src/app/layout.tsx` using Next.js `Script` component. **Important:** GA4 only tracks Next.js pages automatically. For non-Next.js pages (Flask apps, external learning modules), you must manually add the gtag script to their base template:
  ```html
  <!-- Add to <head> of Flask base.html or other templates -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-0R0F7W8JC4"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-0R0F7W8JC4');
  </script>
  ```

## Database

Core models in `prisma/schema.prisma`:
- `User` - OAuth users with role ("admin" or "user")
- `BlogPost` - Blog entries with categories, tags, comments (status: "draft" | "published")
- `ChatSession`/`ChatMessage` - AI chatbot conversation history
- `PageView` - Custom analytics tracking (includes UTM params: `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`)
- `ResumeDownload` - Resume request tracking with email/domain

Tables use `@@map()` for snake_case naming (e.g., `blog_posts`, `chat_sessions`).

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/analytics/track` | Track page views with geo data |
| `/api/analytics/backfill-geo` | Backfill geo data for existing records |
| `/api/chat` | AI chatbot (SSE streaming) |
| `/api/auth/*` | NextAuth.js authentication |
| `/api/blogs/*` | Blog CRUD operations |
| `/api/resume-downloads` | Resume download tracking |

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` - NextAuth config
- `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET` - OAuth providers
- `OPENAI_API_KEY` - AI chatbot
- `NEXT_PUBLIC_EMAILJS_*` - Contact form (service ID, template ID, public key)

## Deployment

### GitHub as Source of Truth

Both apps deploy from GitHub repositories:

```
┌─────────────┐     git push      ┌─────────────┐    cron pull        ┌─────────────┐
│   Local     │  ──────────────►  │   GitHub    │  ◄───────────────   │    VPS      │
│   Machine   │                   │   Repos     │    (every 2 min)    │   Server    │
└─────────────┘                   └─────────────┘                     └─────────────┘
                                        │
                                        ├── legolasan_in (portfolio)
                                        └── sql_learn (mysql learning)
```

| App | GitHub Repo | VPS Path |
|-----|-------------|----------|
| Portfolio | `Legolasan/legolasan_in` | `/var/www/portfolio` |
| MySQL Learning | `Legolasan/sql_learn` | `/home/ubuntu/apps/sql_learn` |
| Unix Learning | `Legolasan/unix_networking` | `/home/ubuntu/apps/unix_networking` |

### Auto-Deploy via Cron (Pull-based)

VPS pulls from GitHub every 2 minutes and deploys if changes detected.

**Cron jobs on VPS:**
```
*/2 * * * * /home/ubuntu/auto-deploy.sh              # Portfolio
*/2 * * * * /home/ubuntu/auto-deploy-mysql-learn.sh  # MySQL Learning
*/2 * * * * /home/ubuntu/auto-deploy-unix-learn.sh   # Unix Learning
```

**Logs:**
- Portfolio: `/home/ubuntu/deploy.log`
- MySQL Learning: `/home/ubuntu/deploy-mysql.log`
- Unix Learning: `/home/ubuntu/deploy-unix.log`

**How it works:**
1. `git push` to GitHub
2. VPS detects new commits within 2 minutes
3. Auto-pulls and rebuilds

**Note:** GitHub Actions workflow exists but VPS provider blocks incoming SSH from GitHub IPs. Cron-based pull is the workaround.

### VPS Infrastructure

- **Server:** `ubuntu@195.35.22.87` (Ubuntu 22.04)
- **Domain:** https://legolasan.in
- **Process Manager:** PM2 (Node.js + Python apps)
- **Web Server:** Nginx (reverse proxy + SSL via Let's Encrypt)

### Manual Deployment Scripts

For immediate deployment (bypasses 2-minute cron wait):
```bash
./deploy/deploy.sh              # Portfolio
./deploy/deploy-learn-apps.sh   # MySQL Learning
```

### Nginx Configuration

Located at `/etc/nginx/sites-available/portfolio.conf`:
- Main Next.js app: `location /` → `http://127.0.0.1:3000`
- MySQL Learning: `location /learn/mysql/` → `http://127.0.0.1:5001`
- Unix Learning: `location /learn/unix/` → `http://127.0.0.1:5002`

### PM2 Processes

| Name | Type | Port | Description |
|------|------|------|-------------|
| portfolio | Node.js | 3000 | Main Next.js app |
| mysql-learn | Python/Gunicorn | 5001 | MySQL Learning Flask app |
| unix-learn | Python/Gunicorn | 5002 | Unix Learning Flask app (uses Docker) |

Commands: `pm2 list`, `pm2 logs`, `pm2 restart all`

