#!/bin/bash

# Auto-deploy script that watches for file changes and deploys automatically
# Usage: ./watch-deploy.sh

set -e

echo "👀 Starting file watcher for auto-deployment..."
echo "📁 Watching: src/, public/, and config files"
echo "🔄 Changes will trigger automatic deployment"
echo "Press Ctrl+C to stop"
echo ""

# Check if fswatch is installed (macOS)
if ! command -v fswatch &> /dev/null; then
    echo "⚠️  fswatch not found. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install fswatch
    else
        echo "❌ Please install Homebrew first: https://brew.sh"
        echo "   Then run: brew install fswatch"
        exit 1
    fi
fi

# Function to deploy with debounce
DEPLOY_DELAY=3  # Wait 3 seconds after save before deploying
LAST_DEPLOY_TIME=0

deploy() {
    CURRENT_TIME=$(date +%s)
    TIME_SINCE_LAST=$((CURRENT_TIME - LAST_DEPLOY_TIME))
    
    # If less than DEPLOY_DELAY seconds since last deploy, skip
    if [ $TIME_SINCE_LAST -lt $DEPLOY_DELAY ]; then
        echo "⏳ Waiting for more changes... (deploying in $((DEPLOY_DELAY - TIME_SINCE_LAST))s)"
        return
    fi
    
    echo ""
    echo "💾 File saved! Deploying..."
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
    ./deploy/deploy.sh
    echo "✅ Deployment complete!"
    echo "👀 Watching for changes..."
    echo ""
    
    LAST_DEPLOY_TIME=$(date +%s)
}

echo "💾 Will deploy automatically when you SAVE files (not during typing)"
echo "⏱️  Waits $DEPLOY_DELAY seconds after save before deploying"
echo ""

# Watch for changes in src/, public/, and config files
# Use -l 1 to reduce latency and only trigger on actual file saves
fswatch -l 1 -o \
    src/ \
    public/ \
    next.config.js \
    tailwind.config.js \
    tsconfig.json \
    package.json \
    | while read f; do
    deploy
done

