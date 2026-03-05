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
- `/admin/client-projects` - Client project management
- `/admin/client-feedback` - Client feedback management (view, categorize, resolve)
- `/blogs/admin/` - Blog-specific admin (posts, categories, tags, comments)
- `stats.legolasan.in` - Real-time system monitoring dashboard (standalone service, not part of portfolio)

Note: `/blogs/admin/login` redirects to `/admin/login` for unified authentication.

## Stats Dashboard (stats.legolasan.in) - STANDALONE

Terminal-themed real-time monitoring dashboard. **Completely independent** from the portfolio - survives portfolio failures.

**Features:**
- System resources: CPU, memory, disk usage with progress bars
- PM2 process monitoring: Status, CPU, memory, uptime, restart count
- Service health checks: Nginx, PostgreSQL, MariaDB status
- Endpoint health: HTTP health checks with response times (ports 3000, 5001, 5003)
- Auto-refresh every 5 seconds (toggle to pause)
- Terminal aesthetic: Neon green (#00ff41) on dark navy (#0a0e27), monospace fonts

**Architecture:**
- **Standalone Express app** at `/home/ubuntu/apps/stats-dashboard/` (port 5004)
- **Zero dependencies on portfolio** - no Next.js, no Prisma, no shared code
- **Authentication:** Protected by Cloudflare Zero Trust at subdomain level
- **Caching:** System (5s), PM2 (2s), Services (30s) to reduce system load
- **Rate limiting:** 60 requests/minute per IP (in-memory)

**Why standalone?**
| Scenario | Stats Shows |
|----------|-------------|
| Prisma migration fails | PM2: portfolio errored, endpoint unhealthy |
| TypeScript build error | PM2: portfolio stopped |
| Next.js runtime crash | PM2: portfolio offline, restart count increasing |
| Bad deploy | PM2 status + endpoint response times |

**Deployment:**
```bash
./deploy/deploy-stats-dashboard.sh  # Deploys to VPS
```

**VPS Location:** `/home/ubuntu/apps/stats-dashboard/`
- `server.js` - Express server with all API endpoints
- `public/` - Static HTML, CSS, JS

## Learning Hub

- `/learn` - Landing page with learning module cards (extensible - add modules to `learningModules` array in `data.ts`)
- `/learn/mysql/` - MySQL Learning Flask app (reverse proxied from port 5001)
- `/learn/unix/` - Unix & Networking Learning Flask app (reverse proxied from port 5003, requires Docker)

### Adding New Learning Modules

1. Add a new `LearningModule` entry in `src/lib/data.ts`
2. For external Flask apps, create a deployment script in `deploy/` and add Nginx reverse proxy config

### Flask App Deployment Architecture

```
Learning Apps (Flask + Gunicorn + PM2)
├── /home/ubuntu/apps/sql_learn/        # MySQL Learning app (port 5001)
├── /home/ubuntu/apps/unix_networking/  # Unix Learning app (port 5003, uses Docker)
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
- `unix-learn` → port 5003 → `/learn/unix/`

### Generated Config Files (Not in Repo)

The deploy scripts create these files on VPS - they persist through auto-deploys:
- `wsgi.py` - WSGI wrapper with ProxyFix for URL prefix handling
- `gunicorn_config.py` - Gunicorn bind address and worker config
- `ecosystem.config.js` - PM2 process configuration

### URL Prefix Handling

Flask apps served under a subpath need proper URL generation:
1. Nginx sends `X-Forwarded-Prefix` header
2. WSGI wrapper uses `ProxyFix(app.wsgi_app, x_prefix=1)`
3. Templates must use `url_for()` instead of hardcoded URLs

**Important:** If templates use hardcoded URLs like `href="/concepts"`, they will 404 when served under `/learn/unix/`. Always use `url_for('blueprint.route_name')` in Flask templates.

## Client Feedback System

Embeddable feedback widget for client projects. Allows clients to submit feedback with screenshots, element selection, and context.

### Architecture
- **Widget:** Embeddable JavaScript widget served from `/feedback-widget/*` (CORS-enabled)
- **API:** Token-based authentication for external access (`/api/client-feedback`)
- **Admin:** Full dashboard at `/admin/client-projects` and `/admin/client-feedback`

### Client Project Setup
1. Create project in admin panel at `/admin/client-projects`
2. Generate unique access token (auto-generated, can be regenerated)
3. Embed widget in client project using provided snippet
4. Clients submit feedback with screenshots, element references, and context
5. Admin reviews, categorizes, and resolves feedback

### Authentication Model
- **Admin access:** Full CRUD via NextAuth session
- **Client access:** Read-only project data + submit feedback via access token
- **Token validation:** Checked on every request, can be disabled per project

### Feedback Metadata Captured
- Page URL, path, viewport dimensions
- Element selector, text, and HTML (if clicked on element)
- Screenshot data (base64)
- Position (x, y) coordinates
- Client name/email (optional)
- IP address and user agent
- Geo location (via standard geo-tracking)

### Status Workflow
Feedback status: `open` → `in_progress` → `resolved` | `archived`
Priority levels: `low`, `normal`, `high`, `urgent`
Categories: `bug`, `design`, `content`, `feature`, `other`

## Key Patterns

- **"use client"** directive required for interactive components (hooks, state, browser APIs)
- **Framer Motion** for animations throughout
- **Path alias:** `@/*` maps to `./src/*`
- **Static content:** Edit `src/lib/data.ts` for portfolio updates (projects, experience, skills, tools, learning modules)
- **Experience backup:** `src/lib/data.backup.ts` contains the original separate Technical Operations Manager + Product Support Manager roles. To restore, replace the merged entry in `data.ts` with the two entries from the backup file.
- **Role-based auth:** First OAuth user auto-becomes admin; middleware protects `/admin/*` and `/blogs/admin/*`
- **Geo-tracking:** IP geolocation via ip-api.com (free, 45 req/min, 24-hour caching). World map uses react-simple-maps with coordinates derived from city names.
- **CSP Headers:** Configured in `next.config.js`. Add external domains to `connect-src` when needed (e.g., cdn.jsdelivr.net for map data).
- **CORS Configuration:** Client feedback API (`/api/client-feedback/*`) has CORS enabled (`Access-Control-Allow-Origin: *`) for embedded widget usage. Feedback widget static files (`/feedback-widget/*`) also have CORS headers.
- **Rate limiting:** Use `rateLimiters.chat`, `.standard`, `.strict`, `.relaxed`, `.analytics` from `rateLimit.ts`. Get client IP with `getClientIP(request)`.
- **Chat API:** SSE streaming with OpenAI, 10 questions/session, 20 questions/IP/day. Uses `ReadableStream` for real-time responses. Limit responses sent via same SSE stream format as normal responses.
- **Input sanitization:** All API routes validate and sanitize inputs (max lengths, regex patterns). Check existing routes for reference patterns.
- **Error handling:** Database errors in analytics/chat logging don't break requests (graceful degradation). Development mode shows detailed logs.
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
- `Account`, `Session`, `VerificationToken` - NextAuth.js requirements
- `BlogPost` - Blog entries with categories, tags, comments (status: "draft" | "published")
- `Category`, `Tag`, `PostCategory`, `PostTag` - Blog taxonomy (many-to-many relations)
- `Comment` - Blog comments with moderation (status: "pending" | "approved" | "rejected")
- `ChatSession`/`ChatMessage` - AI chatbot conversation history with geo/device tracking
- `PageView` - Custom analytics tracking (includes UTM params: `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`)
- `ResumeDownload` - Resume request tracking with email/domain
- `ClientProject` - Client projects with feedback widget integration (access token-based auth)
- `ClientFeedback` - Client feedback submissions with screenshots, element selectors, and admin workflow (status: "open" | "in_progress" | "resolved" | "archived")
- `DeploymentLog` - Deployment history tracking (app name, status, commit SHA, duration, errors)
- `ApiMetric` - API performance tracking (endpoint, method, status code, response time)

Tables use `@@map()` for snake_case naming (e.g., `blog_posts`, `chat_sessions`). Strategic indexes on frequently queried fields.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/track` | POST | Track page views with geo data |
| `/api/analytics/backfill-geo` | POST | Backfill geo data for existing records (admin only) |
| `/api/chat` | POST | AI chatbot (SSE streaming with rate limits) |
| `/api/auth/*` | GET/POST | NextAuth.js authentication |
| `/api/blogs` | GET/POST | Blog CRUD operations |
| `/api/blogs/search` | GET | Search blog posts by title/content |
| `/api/categories` | GET/POST | Blog category management |
| `/api/tags` | GET/POST | Blog tag management |
| `/api/comments` | POST | Submit blog comments (moderation queue) |
| `/api/chats` | GET | Chat history (admin only) |
| `/api/github/*` | GET | GitHub stats proxy |
| `/api/resume-downloads` | POST | Track resume downloads with email |
| `/api/upload` | POST | File upload handler |
| `/api/client-feedback` | GET/POST/PUT | Client feedback system (CORS-enabled, token or admin auth) |
| `/api/client-feedback/export` | GET | Export feedback as CSV/JSON (admin only) |

**Stats API (Standalone Service on port 5004):**
| `stats.legolasan.in/api/system` | GET | System resources (CPU, memory, disk, uptime) |
| `stats.legolasan.in/api/pm2` | GET | PM2 process monitoring |
| `stats.legolasan.in/api/services` | GET | Service + endpoint health checks |

## Important Development Patterns

### API Route Structure
- Always validate and sanitize inputs (see `/api/chat/route.ts` for reference)
- Use `rateLimiters` from `rateLimit.ts` with `getClientIP(request)`
- Return consistent error responses: `NextResponse.json({ error: 'message' }, { status: code })`
- For streaming: Use `ReadableStream` with SSE format (`data: {JSON}\n\n`, end with `data: [DONE]\n\n`)
- Graceful degradation: Analytics/logging failures shouldn't break requests

### Database Queries
- Reusable queries go in `src/lib/queries/` (see `posts.ts`, `categories.ts`, `comments.ts`)
- Use Prisma singleton from `src/lib/db.ts`
- Limit string field lengths before saving (check schema for max lengths)
- Use try/catch blocks; log errors only in development mode

### Component Patterns
- Interactive components need `"use client"` directive
- Use Framer Motion for animations (consistent `initial`, `animate`, `transition` props)
- Theme-aware styling: Use Tailwind's dark mode classes (`dark:`)
- Icons from `react-icons` library (e.g., `react-icons/fa`, `react-icons/bs`)

### Session Management
- Chat sessions: Client generates ID (`chat_${timestamp}_${random}`), stored in sessionStorage
- NextAuth sessions: JWT strategy with role embedded, refreshed on each request
- First OAuth user auto-becomes admin (check `User` table)

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
                                        ├── sql_learn (mysql learning)
                                        └── unix_networking (unix learning)
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

**Auto-deploy script steps (for standalone mode):**
```bash
git pull origin main
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
# CRITICAL: Copy static files to standalone
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
# Restart PM2 from standalone directory
pm2 delete portfolio
cd .next/standalone && PORT=3000 pm2 start server.js --name portfolio
pm2 save
```

**Note:** GitHub Actions workflow exists but VPS provider blocks incoming SSH from GitHub IPs. Cron-based pull is the workaround.

### VPS Infrastructure

- **Server:** `ubuntu@XXX.XX.XX.XX` (Ubuntu 22.04)
- **Domain:** https://legolasan.in
- **Process Manager:** PM2 (Node.js + Python apps)
- **Web Server:** Nginx (reverse proxy + SSL via Let's Encrypt)

### Next.js Standalone Mode (CRITICAL)

This project uses `output: "standalone"` in `next.config.js`. This has important implications:

**How Standalone Mode Works:**
- Build creates a self-contained server at `.next/standalone/server.js`
- Does NOT work with `npm start` or `next start` (will show error)
- Must run: `node .next/standalone/server.js`

**Required Post-Build Steps:**
After `npm run build`, you MUST copy static assets:
```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

**PM2 Configuration:**
- Must run from standalone directory: `cd .next/standalone && pm2 start server.js --name portfolio`
- Script path should be: `/var/www/portfolio/.next/standalone/server.js`
- Working directory should be: `/var/www/portfolio/.next/standalone`

**Common Errors:**
- `"next start" does not work with "output: standalone"` → Use `node server.js` instead
- `Could not find a production build in the '.next' directory` → PM2 running from wrong directory
- `Application error: client-side exception` → Missing static files (forgot to copy public/static)
- 404 errors after deploy → Server running old build (check PM2 is restarted correctly)

### Manual Deployment Scripts

For immediate deployment (bypasses 2-minute cron wait):
```bash
./deploy/deploy.sh                  # Portfolio
./deploy/deploy-learn-apps.sh       # MySQL Learning
./deploy/deploy-unix-learn.sh       # Unix Learning (builds Docker image too)
./deploy/deploy-stats-dashboard.sh  # Stats Dashboard (standalone, no git repo)
```

### Nginx Configuration

Located at `/etc/nginx/sites-available/portfolio.conf`:
- Main Next.js app: `location /` → `http://127.0.0.1:3000`
- MySQL Learning: `location /learn/mysql/` → `http://127.0.0.1:5001`
- Unix Learning: `location /learn/unix/` → `http://127.0.0.1:5003`
- Stats subdomain: `stats.legolasan.in` → `http://127.0.0.1:5004` (standalone service)

**Stats Subdomain Configuration:**
Now simplified - direct proxy to standalone stats service:

```nginx
server {
    listen 443 ssl http2;
    server_name stats.legolasan.in;

    ssl_certificate /etc/letsencrypt/live/legolasan.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/legolasan.in/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5004;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Cloudflare Zero Trust:**
- Stats subdomain is behind Cloudflare Zero Trust
- SSL certificate expansion may fail (Let's Encrypt can't verify through Zero Trust)
- Solution: Use existing cert, Cloudflare handles edge SSL

### PM2 Processes

| Name | Type | Port | Description |
|------|------|------|-------------|
| portfolio | Node.js | 3000 | Main Next.js app |
| mysql-learn | Python/Gunicorn | 5001 | MySQL Learning Flask app |
| unix-learn | Python/Gunicorn | 5003 | Unix Learning Flask app (uses Docker) |
| stats-dashboard | Node.js | 5004 | **Standalone** system monitoring (independent of portfolio) |

**Note:** Port 5002 is reserved by `/srv/gallery` (tag-api service).

Commands: `pm2 list`, `pm2 logs`, `pm2 restart all`

### Port Allocation

| Port | Service | Notes |
|------|---------|-------|
| 3000 | Portfolio (Next.js) | Main website |
| 5001 | MySQL Learning | Flask/Gunicorn |
| 5002 | Gallery Tag API | **Reserved** - do not use |
| 5003 | Unix Learning | Flask/Gunicorn + Docker |
| 5004 | Stats Dashboard | **Standalone** Express.js (independent of portfolio) |
| 5555 | Prisma Studio | Dev only (`npm run prisma:studio`) |

## Common Tasks Quick Reference

### Update Portfolio Content
Edit `src/lib/data.ts` and modify:
- `personalInfo` - Bio, contact info
- `experiences` - Work history
- `skills` - Technical skills by category
- `projects` - Portfolio projects
- `tools` - Tools/technologies showcase
- `learningModules` - Learning hub modules

Changes appear immediately on next page refresh (no rebuild needed for static content).

### Add New Blog Post
Use the blog admin UI at `/blogs/admin/` or create via API:
```typescript
POST /api/blogs
{
  title: string,
  slug: string,  // URL-friendly (auto-generated if omitted)
  content: string,  // HTML from Quill editor
  excerpt: string,
  status: "draft" | "published",
  publishedAt?: string,  // ISO date
  categoryIds?: string[],
  tagNames?: string[]
}
```

### Check Logs
- **Portfolio:** `ssh ubuntu@XXX.XX.XX.XX "tail -f /home/ubuntu/deploy.log"`
- **MySQL Learning:** `ssh ubuntu@XXX.XX.XX.XX "tail -f /home/ubuntu/deploy-mysql.log"`
- **Unix Learning:** `ssh ubuntu@XXX.XX.XX.XX "tail -f /home/ubuntu/deploy-unix.log"`
- **PM2 Logs:** `ssh ubuntu@XXX.XX.XX.XX "pm2 logs"`

### Database Migrations
```bash
# Create migration after schema changes
npm run prisma:migrate

# View/edit data in browser UI
npm run prisma:studio  # Opens http://localhost:5555
```

### Deploy Changes
```bash
# Auto-deploy (wait up to 2 minutes)
git add . && git commit -m "message" && git push

# Immediate deploy
./deploy/deploy.sh                  # Portfolio
./deploy/deploy-learn-apps.sh       # MySQL Learning
./deploy/deploy-unix-learn.sh       # Unix Learning
./deploy/deploy-stats-dashboard.sh  # Stats Dashboard (code embedded in script)
```

## Troubleshooting

### Standalone Mode Issues

**Error: `"next start" does not work with "output: standalone"`**
- PM2 is running `npm start` instead of `node server.js`
- Fix: `pm2 delete portfolio && cd /var/www/portfolio/.next/standalone && pm2 start server.js --name portfolio`

**Error: `Could not find a production build in the '.next' directory`**
- PM2 is running from wrong directory (project root instead of standalone)
- Check: `pm2 show portfolio` should show script path ending in `.next/standalone/server.js`

**Error: `Application error: client-side exception` on page load**
- Missing static files in standalone directory
- Fix: `cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/`

**404 after deployment despite successful build**
- Server running old build (PM2 didn't pick up new files)
- Check BUILD_ID: `cat /var/www/portfolio/.next/standalone/.next/BUILD_ID`
- Fix: Full restart: `pm2 delete portfolio && cd /var/www/portfolio/.next/standalone && pm2 start server.js --name portfolio`

### Stats Dashboard Issues

**Stats dashboard not loading**
- Check if standalone service is running: `pm2 status stats-dashboard`
- Check logs: `pm2 logs stats-dashboard`
- Verify port 5004 is listening: `netstat -tlnp | grep 5004`

**Stats shows portfolio as offline when it crashed**
- This is expected! Stats is designed to diagnose portfolio failures
- Stats showing "portfolio: stopped" or "endpoint unhealthy" confirms it's working

**SSL certificate errors on stats subdomain**
- Cloudflare Zero Trust blocks Let's Encrypt verification
- Solution: Use existing certificate, Cloudflare handles edge SSL

**Redeploy stats dashboard**
```bash
./deploy/deploy-stats-dashboard.sh
```

### PM2 Issues

**Process keeps restarting (restart count increasing)**
- Check logs: `pm2 logs portfolio --lines 50`
- Usually means wrong start command or missing dependencies

**Port 3000 already in use**
- Kill existing processes: `lsof -ti:3000 | xargs -r kill -9`
- Then restart PM2

**Changes not reflected after restart**
- PM2 caches the old process configuration
- Fix: `pm2 delete portfolio` then start fresh

### Git Issues on VPS

**Error: `detected dubious ownership in repository`**
- Fix: `git config --global --add safe.directory /var/www/portfolio`

**Error: `untracked working tree files would be overwritten`**
- Remove conflicting files: `rm -f <files>` then `git pull`

