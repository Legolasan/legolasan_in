#!/usr/bin/env node

/**
 * Auto-deploy script using Node.js (cross-platform)
 * Watches for file changes and automatically deploys
 * Usage: node watch-deploy.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if chokidar-cli is installed
let chokidar;
try {
  chokidar = require('chokidar');
} catch (e) {
  log('⚠️  chokidar not found. Installing...', 'yellow');
  try {
    execSync('npm install --save-dev chokidar', { stdio: 'inherit' });
    chokidar = require('chokidar');
    log('✅ chokidar installed successfully!', 'green');
  } catch (err) {
    log('❌ Failed to install chokidar. Please run: npm install --save-dev chokidar', 'red');
    process.exit(1);
  }
}

let deployTimeout;
let isDeploying = false;
let pendingChanges = new Set();
const DEPLOY_DELAY = 3000; // Wait 3 seconds after file save before deploying

function deploy() {
  if (isDeploying) {
    log('⏳ Deployment already in progress, skipping...', 'yellow');
    return;
  }

  // Clear any existing timeout
  clearTimeout(deployTimeout);
  
  // Set a new timeout - this ensures we only deploy after the file has stopped changing
  deployTimeout = setTimeout(() => {
    if (pendingChanges.size === 0) return;
    
    isDeploying = true;
    log('\n🔄 File saved! Deploying...', 'cyan');
    log(`📝 Changed files: ${Array.from(pendingChanges).join(', ')}`, 'blue');
    log(`⏰ ${new Date().toLocaleString()}`, 'blue');
    
    // Clear pending changes
    const changedFiles = Array.from(pendingChanges);
    pendingChanges.clear();
    
    try {
      execSync('./deploy/deploy.sh', { stdio: 'inherit' });
      log('✅ Deployment complete!', 'green');
      log('👀 Watching for changes...\n', 'cyan');
    } catch (error) {
      log('❌ Deployment failed!', 'red');
      log('👀 Still watching for changes...\n', 'cyan');
    } finally {
      isDeploying = false;
    }
  }, DEPLOY_DELAY); // Wait 3 seconds after last save before deploying
}

// Watch directories and files
const watchPaths = [
  'src/**/*',
  'public/**/*',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  'package.json',
];

log('👀 Starting file watcher for auto-deployment...', 'bright');
log('📁 Watching:', 'cyan');
watchPaths.forEach(path => log(`   - ${path}`, 'blue'));
log('💾 Will deploy automatically when you SAVE files (not during typing)', 'cyan');
log(`⏱️  Waits ${DEPLOY_DELAY/1000} seconds after save before deploying`, 'blue');
log('Press Ctrl+C to stop\n', 'yellow');

const watcher = chokidar.watch(watchPaths, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true,
});

watcher
  .on('add', filePath => {
    log(`📄 File added: ${filePath}`, 'blue');
    pendingChanges.add(filePath);
    deploy();
  })
  .on('change', filePath => {
    // Only log, don't show "changed" - we'll show "saved" when deploying
    pendingChanges.add(filePath);
    log(`💾 File saved: ${filePath}`, 'green');
    deploy();
  })
  .on('unlink', filePath => {
    log(`🗑️  File deleted: ${filePath}`, 'yellow');
    pendingChanges.add(filePath);
    deploy();
  })
  .on('error', error => {
    log(`❌ Watcher error: ${error}`, 'red');
  });

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n👋 Stopping file watcher...', 'yellow');
  watcher.close();
  process.exit(0);
});

