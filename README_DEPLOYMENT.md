# Auto-Deployment Guide

This guide explains how to automatically deploy your portfolio website when you make changes to your content.

## Quick Start

### Option 1: Node.js Watcher (Recommended - Cross-platform)

```bash
npm run watch:deploy
```

This will:
- Watch for changes in `src/`, `public/`, and config files
- Automatically deploy when you **SAVE** files (not during typing)
- Wait 3 seconds after you save before deploying (to batch multiple saves)

### Option 2: Bash Watcher (macOS/Linux)

```bash
npm run watch:deploy:bash
# or
./watch-deploy.sh
```

**Note:** Requires `fswatch` to be installed:
```bash
brew install fswatch  # macOS
```

## Manual Deployment

If you prefer to deploy manually:

```bash
npm run deploy
# or
./deploy/deploy.sh
```

## What Gets Watched?

The watcher monitors:
- `src/**/*` - All source files (components, pages, data)
- `public/**/*` - Public assets (images, resume.pdf, etc.)
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies

## Workflow

1. **Start the watcher:**
   ```bash
   npm run watch:deploy
   ```

2. **Edit your files:**
   - Edit `src/lib/data.ts` with your information
   - Add images to `public/images/`
   - Update resume: `public/resume.pdf`
   - Modify components in `src/components/`

3. **Save your changes:**
   - The watcher detects when you **save** the file (Cmd+S / Ctrl+S)
   - Waits 3 seconds after save (to catch multiple quick saves)
   - Automatically builds and deploys
   - Your changes go live!
   - **Note:** It won't deploy while you're typing, only when you save!

4. **Stop the watcher:**
   - Press `Ctrl+C` in the terminal

## Tips

- **Only deploys on save** - The watcher waits for you to save files (Cmd+S / Ctrl+S), not during typing
- **Batches multiple saves** - If you save multiple files quickly, it waits 3 seconds then deploys once
- You can still manually deploy anytime with `npm run deploy`
- The watcher shows which files were saved before deploying
- Check the terminal output to see deployment progress
- If you're actively editing, it won't deploy until you stop saving for 3 seconds

## Troubleshooting

**Watcher not starting?**
- Make sure you're in the project directory
- Try installing dependencies: `npm install`
- For bash watcher, install fswatch: `brew install fswatch`

**Deployment failing?**
- Check your SSH connection to the server
- Verify the server is accessible: `ssh root@195.35.22.87`
- Check the deployment script: `./deploy/deploy.sh`

**Changes not reflecting?**
- Wait for deployment to complete (check terminal)
- Hard refresh your browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Clear browser cache if needed

