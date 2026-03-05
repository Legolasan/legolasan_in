#!/bin/bash
# Standalone Stats Dashboard Deployment
# This creates a completely independent monitoring service
# Port: 5004

set -e

# Configuration
VPS_USER="root"
VPS_HOST="195.35.22.87"
APP_DIR="/home/ubuntu/apps/stats-dashboard"
PM2_NAME="stats-dashboard"
PORT="5004"

echo "=========================================="
echo " Deploying Standalone Stats Dashboard"
echo "=========================================="
echo ""

ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e

APP_DIR="/home/ubuntu/apps/stats-dashboard"
PM2_NAME="stats-dashboard"
PORT="5004"

echo "[1/7] Creating directory structure..."
mkdir -p ${APP_DIR}/public
cd ${APP_DIR}

echo "[2/7] Writing package.json..."
cat > package.json << 'EOF'
{
  "name": "stats-dashboard",
  "version": "1.0.0",
  "description": "Standalone system monitoring dashboard",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

echo "[3/7] Writing server.js..."
cat > server.js << 'SERVERJS'
const express = require('express');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 5004;

// Simple in-memory rate limiting
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute

function rateLimit(ip) {
  const now = Date.now();
  const record = rateLimits.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    record.count++;
  }

  rateLimits.set(ip, record);
  return record.count <= RATE_LIMIT_MAX;
}

// Cleanup old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimits.entries()) {
    if (now > record.resetTime) {
      rateLimits.delete(ip);
    }
  }
}, 300000);

// Caches
let systemCache = { data: null, timestamp: 0 };
let pm2Cache = { data: null, timestamp: 0 };
let servicesCache = { data: null, timestamp: 0 };

const SYSTEM_CACHE_TTL = 5000;
const PM2_CACHE_TTL = 2000;
const SERVICES_CACHE_TTL = 30000;

// Rate limiting middleware
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions
async function getDiskUsage() {
  try {
    const { stdout } = await execAsync('df -k / | tail -1');
    const parts = stdout.trim().split(/\s+/);
    const total = parseInt(parts[1]) * 1024;
    const used = parseInt(parts[2]) * 1024;
    const free = parseInt(parts[3]) * 1024;
    return { total, used, free };
  } catch (error) {
    console.error('Error getting disk usage:', error);
    return { total: 0, used: 0, free: 0 };
  }
}

async function getCPUUsage() {
  return new Promise((resolve) => {
    const startMeasure = process.cpuUsage();
    const startTime = Date.now();

    setTimeout(() => {
      const elapsed = Date.now() - startTime;
      const endMeasure = process.cpuUsage(startMeasure);
      const totalUsage = (endMeasure.user + endMeasure.system) / 1000;
      const usage = (totalUsage / elapsed) * 100;
      resolve(Math.min(Math.round(usage * 10) / 10, 100));
    }, 100);
  });
}

// API: System Stats
app.get('/api/system', async (req, res) => {
  try {
    const now = Date.now();

    if (systemCache.data && (now - systemCache.timestamp) < SYSTEM_CACHE_TTL) {
      return res.json(systemCache.data);
    }

    const cpus = os.cpus();
    const cpuUsage = await getCPUUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const disk = await getDiskUsage();

    const stats = {
      cpu: {
        usage: cpuUsage,
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        loadAvg: os.loadavg(),
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usagePercent: Math.round((usedMem / totalMem) * 100),
      },
      disk: {
        total: disk.total,
        used: disk.used,
        free: disk.free,
        usagePercent: disk.total > 0 ? Math.round((disk.used / disk.total) * 100) : 0,
      },
      uptime: os.uptime(),
      platform: os.platform(),
      hostname: os.hostname(),
    };

    systemCache = { data: stats, timestamp: now };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

// API: PM2 Stats
app.get('/api/pm2', async (req, res) => {
  try {
    const now = Date.now();

    if (pm2Cache.data && (now - pm2Cache.timestamp) < PM2_CACHE_TTL) {
      return res.json(pm2Cache.data);
    }

    const { stdout } = await execAsync('pm2 jlist 2>/dev/null || echo "[]"');
    const processes = JSON.parse(stdout);

    const stats = processes.map((proc) => ({
      pm_id: proc.pm2_env?.pm_id ?? proc.pm_id ?? 0,
      name: proc.name || 'unknown',
      status: proc.pm2_env?.status || 'unknown',
      cpu: proc.monit?.cpu ?? 0,
      memory: proc.monit?.memory ?? 0,
      uptime: proc.pm2_env?.pm_uptime ? Date.now() - proc.pm2_env.pm_uptime : 0,
      restarts: proc.pm2_env?.restart_time ?? 0,
      pid: proc.pid ?? 0,
    }));

    const result = { processes: stats };
    pm2Cache = { data: result, timestamp: now };
    res.json(result);
  } catch (error) {
    console.error('Error fetching PM2 stats:', error);
    res.json({ processes: [] });
  }
});

// API: Services
app.get('/api/services', async (req, res) => {
  try {
    const now = Date.now();

    if (servicesCache.data && (now - servicesCache.timestamp) < SERVICES_CACHE_TTL) {
      return res.json(servicesCache.data);
    }

    // Check system services
    const serviceNames = ['nginx', 'postgresql', 'mariadb'];
    const services = await Promise.all(serviceNames.map(async (name) => {
      try {
        const { stdout } = await execAsync(`systemctl is-active ${name} 2>/dev/null || echo "inactive"`);
        const isActive = stdout.trim() === 'active';

        if (isActive) {
          try {
            const { stdout: statusOutput } = await execAsync(`systemctl status ${name} 2>/dev/null | grep "Active:" || echo ""`);
            const uptimeMatch = statusOutput.match(/since (.+?);/);
            return { name, status: 'active', uptime: uptimeMatch ? uptimeMatch[1] : undefined };
          } catch {
            return { name, status: 'active' };
          }
        }
        return { name, status: 'inactive' };
      } catch {
        return { name, status: 'unknown' };
      }
    }));

    // Check endpoints
    const endpointUrls = [
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5001',
      'http://127.0.0.1:5003',
    ];

    const endpoints = await Promise.all(endpointUrls.map(async (url) => {
      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'User-Agent': 'Stats-Monitor' },
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const responseTime = Date.now() - startTime;

        return {
          url,
          status: response.status,
          responseTime,
          healthy: response.status >= 200 && response.status < 400,
        };
      } catch (error) {
        return {
          url,
          status: 0,
          responseTime: Date.now() - startTime,
          healthy: false,
        };
      }
    }));

    const result = {
      services,
      endpoints,
      timestamp: new Date().toISOString(),
    };

    servicesCache = { data: result, timestamp: now };
    res.json(result);
  } catch (error) {
    console.error('Error fetching service stats:', error);
    res.status(500).json({ error: 'Failed to fetch service stats' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Stats Dashboard running on http://127.0.0.1:${PORT}`);
});
SERVERJS

echo "[4/7] Writing public/index.html..."
cat > public/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Status Monitor</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="card header">
      <div class="header-content">
        <div class="title-box">
          <div class="title-line">+---------------------------------------+</div>
          <div class="title-line">|  SYSTEM STATUS MONITOR v1.0.0        |</div>
          <div class="title-line">+---------------------------------------+</div>
        </div>
        <div class="controls">
          <button id="refreshToggle" class="btn active">
            <span class="icon">&#8635;</span>
            AUTO-REFRESH [<span id="refreshStatus">ON</span>]
          </button>
          <div class="last-update">
            LAST UPDATE: <span id="lastUpdate">--:--:--</span>
          </div>
        </div>
      </div>
    </div>

    <!-- System Stats Grid -->
    <div class="grid grid-3">
      <!-- CPU -->
      <div class="card stat-card" id="cpuCard">
        <div class="stat-header">
          <span class="icon-text">&#9881;</span>
          <span>CPU USAGE</span>
        </div>
        <div class="stat-value" id="cpuValue">--%</div>
        <div class="progress-bar">
          [<span id="cpuBar">--------------------</span>] <span id="cpuPercent">0</span>%
        </div>
        <div class="stat-details">
          <div>CORES: <span id="cpuCores">-</span></div>
          <div>LOAD: <span id="cpuLoad">-</span></div>
        </div>
      </div>

      <!-- Memory -->
      <div class="card stat-card" id="memCard">
        <div class="stat-header">
          <span class="icon-text">&#9638;</span>
          <span>MEMORY</span>
        </div>
        <div class="stat-value" id="memValue">--%</div>
        <div class="progress-bar">
          [<span id="memBar">--------------------</span>] <span id="memPercent">0</span>%
        </div>
        <div class="stat-details">
          <div>USED: <span id="memUsed">-</span></div>
          <div>TOTAL: <span id="memTotal">-</span></div>
        </div>
      </div>

      <!-- Disk -->
      <div class="card stat-card" id="diskCard">
        <div class="stat-header">
          <span class="icon-text">&#9776;</span>
          <span>DISK USAGE</span>
        </div>
        <div class="stat-value" id="diskValue">--%</div>
        <div class="progress-bar">
          [<span id="diskBar">--------------------</span>] <span id="diskPercent">0</span>%
        </div>
        <div class="stat-details">
          <div>USED: <span id="diskUsed">-</span></div>
          <div>TOTAL: <span id="diskTotal">-</span></div>
        </div>
      </div>
    </div>

    <!-- PM2 Processes -->
    <div class="card">
      <div class="section-header">
        <span class="icon-text">&#9634;</span>
        <span>PM2 PROCESSES</span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>STATUS</th>
              <th class="text-right">CPU</th>
              <th class="text-right">MEMORY</th>
              <th class="text-right">UPTIME</th>
              <th class="text-right">RESTARTS</th>
            </tr>
          </thead>
          <tbody id="pm2Table">
            <tr>
              <td colspan="7" class="text-center warning">[LOADING...]</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Services and Endpoints Grid -->
    <div class="grid grid-2">
      <!-- System Services -->
      <div class="card">
        <div class="section-header">
          <span class="icon-text">&#9889;</span>
          <span>SYSTEM SERVICES</span>
        </div>
        <div class="service-list" id="servicesList">
          <div class="service-item warning">[LOADING...]</div>
        </div>
      </div>

      <!-- Endpoint Health -->
      <div class="card">
        <div class="section-header">
          <span class="icon-text">&#9889;</span>
          <span>ENDPOINT HEALTH</span>
        </div>
        <div class="service-list" id="endpointsList">
          <div class="service-item warning">[LOADING...]</div>
        </div>
      </div>
    </div>

    <!-- System Info -->
    <div class="card">
      <div class="section-header">SYSTEM INFO</div>
      <div class="info-grid">
        <div><span class="info-label">UPTIME:</span> <span id="sysUptime">-</span></div>
        <div><span class="info-label">PLATFORM:</span> <span id="sysPlatform">-</span></div>
        <div><span class="info-label">HOSTNAME:</span> <span id="sysHostname">legolasan.in</span></div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      [STATS DASHBOARD] - Refreshing every 5 seconds
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
HTMLEOF

echo "[5/7] Writing public/styles.css..."
cat > public/styles.css << 'CSSEOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Courier New', Courier, monospace;
  background-color: #0a0e27;
  color: #00ff41;
  min-height: 100vh;
  padding: 1.5rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.card {
  border: 2px solid #00ff41;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
}

.header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-box {
  font-size: 1.2rem;
}

.title-line {
  white-space: pre;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn {
  font-family: inherit;
  background: transparent;
  border: 2px solid #666;
  color: #666;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn.active {
  border-color: #00ff41;
  color: #00ff41;
}

.btn:hover {
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.btn .icon {
  display: inline-block;
}

.btn.active .icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.last-update {
  color: #00d9ff;
  font-size: 0.9rem;
}

.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.stat-card {
  padding: 1rem;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.icon-text {
  font-size: 1.2rem;
}

.stat-value {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.progress-bar {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-details {
  font-size: 0.8rem;
  color: #00d9ff;
}

.stat-details > div {
  margin-top: 0.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th, td {
  padding: 0.5rem;
  text-align: left;
}

th {
  border-bottom: 1px solid #00ff41;
}

td {
  border-bottom: 1px solid rgba(0, 255, 65, 0.3);
}

tr:hover td {
  background: rgba(0, 255, 65, 0.1);
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.status-online, .status-active {
  color: #00ff41;
}

.status-stopped, .status-inactive {
  color: #ef4444;
}

.status-errored {
  color: #dc2626;
}

.status-unknown {
  color: #eab308;
}

.warning {
  color: #eab308;
}

.error {
  color: #ef4444;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid rgba(0, 255, 65, 0.3);
  transition: background 0.3s ease;
}

.service-item:hover {
  background: rgba(0, 255, 65, 0.1);
}

.service-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.service-details {
  font-size: 0.8rem;
  color: #00d9ff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  font-size: 0.9rem;
}

.info-label {
  color: #00d9ff;
}

.footer {
  text-align: center;
  font-size: 0.8rem;
  color: #00d9ff;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  body {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .title-box {
    font-size: 0.9rem;
  }

  .controls {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .grid-2, .grid-3 {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 2rem;
  }
}
CSSEOF

echo "[6/7] Writing public/app.js..."
cat > public/app.js << 'JSEOF'
// State
let autoRefresh = true;
let refreshInterval = null;

// DOM Elements
const refreshToggle = document.getElementById('refreshToggle');
const refreshStatus = document.getElementById('refreshStatus');
const lastUpdate = document.getElementById('lastUpdate');

// Helpers
function formatBytes(bytes) {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb.toFixed(2) + ' GB';
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function getProgressBar(percent, width = 20) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
}

function getStatusSymbol(status) {
  switch (status) {
    case 'online':
    case 'active':
      return '[\u2713]';
    case 'stopped':
    case 'inactive':
      return '[\u2717]';
    case 'errored':
      return '[!]';
    default:
      return '[?]';
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'online':
    case 'active':
      return 'status-online';
    case 'stopped':
    case 'inactive':
      return 'status-stopped';
    case 'errored':
      return 'status-errored';
    default:
      return 'status-unknown';
  }
}

// API Calls
async function fetchSystemStats() {
  try {
    const response = await fetch('/api/system');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();

    // CPU
    document.getElementById('cpuValue').textContent = data.cpu.usage.toFixed(1) + '%';
    document.getElementById('cpuBar').textContent = getProgressBar(data.cpu.usage);
    document.getElementById('cpuPercent').textContent = data.cpu.usage.toFixed(1);
    document.getElementById('cpuCores').textContent = data.cpu.cores;
    document.getElementById('cpuLoad').textContent = data.cpu.loadAvg.map(l => l.toFixed(2)).join(', ');

    // Memory
    document.getElementById('memValue').textContent = data.memory.usagePercent + '%';
    document.getElementById('memBar').textContent = getProgressBar(data.memory.usagePercent);
    document.getElementById('memPercent').textContent = data.memory.usagePercent;
    document.getElementById('memUsed').textContent = formatBytes(data.memory.used);
    document.getElementById('memTotal').textContent = formatBytes(data.memory.total);

    // Disk
    document.getElementById('diskValue').textContent = data.disk.usagePercent + '%';
    document.getElementById('diskBar').textContent = getProgressBar(data.disk.usagePercent);
    document.getElementById('diskPercent').textContent = data.disk.usagePercent;
    document.getElementById('diskUsed').textContent = formatBytes(data.disk.used);
    document.getElementById('diskTotal').textContent = formatBytes(data.disk.total);

    // System info
    document.getElementById('sysUptime').textContent = formatUptime(data.uptime);
    document.getElementById('sysPlatform').textContent = (data.cpu.model || '').substring(0, 40) + '...';
  } catch (error) {
    console.error('Error fetching system stats:', error);
  }
}

async function fetchPM2Stats() {
  try {
    const response = await fetch('/api/pm2');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    const processes = data.processes || [];

    const tbody = document.getElementById('pm2Table');

    if (processes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center warning">[NO PM2 PROCESSES DETECTED]</td></tr>';
      return;
    }

    tbody.innerHTML = processes.map(proc => `
      <tr>
        <td>${proc.pm_id}</td>
        <td>${proc.name}</td>
        <td class="${getStatusClass(proc.status)}">${getStatusSymbol(proc.status)} ${proc.status.toUpperCase()}</td>
        <td class="text-right">${proc.cpu.toFixed(1)}%</td>
        <td class="text-right">${(proc.memory / 1024 / 1024).toFixed(0)}MB</td>
        <td class="text-right">${formatUptime(Math.floor(proc.uptime / 1000))}</td>
        <td class="text-right">${proc.restarts}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error fetching PM2 stats:', error);
    document.getElementById('pm2Table').innerHTML = '<tr><td colspan="7" class="text-center error">[ERROR LOADING PM2 STATS]</td></tr>';
  }
}

async function fetchServiceStats() {
  try {
    const response = await fetch('/api/services');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();

    // Services
    const servicesList = document.getElementById('servicesList');
    const services = data.services || [];

    if (services.length === 0) {
      servicesList.innerHTML = '<div class="service-item warning">[NO SERVICES DETECTED]</div>';
    } else {
      servicesList.innerHTML = services.map(service => `
        <div class="service-item">
          <div class="service-name">
            <span class="${getStatusClass(service.status)}">${getStatusSymbol(service.status)}</span>
            <span>${service.name.toUpperCase()}</span>
          </div>
          <div class="service-details">
            ${service.status === 'active' ? (service.uptime || 'RUNNING') : 'INACTIVE'}
          </div>
        </div>
      `).join('');
    }

    // Endpoints
    const endpointsList = document.getElementById('endpointsList');
    const endpoints = data.endpoints || [];

    if (endpoints.length === 0) {
      endpointsList.innerHTML = '<div class="service-item warning">[NO ENDPOINTS CONFIGURED]</div>';
    } else {
      endpointsList.innerHTML = endpoints.map(endpoint => `
        <div class="service-item">
          <div class="service-name">
            <span class="${endpoint.healthy ? 'status-online' : 'status-stopped'}">
              ${endpoint.healthy ? '[\u2713]' : '[\u2717]'}
            </span>
            <span style="font-size: 0.85rem;">${endpoint.url}</span>
          </div>
          <div class="service-details" style="display: flex; gap: 1rem;">
            <span class="${endpoint.status === 200 ? 'status-online' : 'status-stopped'}">[${endpoint.status || 'ERR'}]</span>
            <span>${endpoint.responseTime}ms</span>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error fetching service stats:', error);
    document.getElementById('servicesList').innerHTML = '<div class="service-item error">[ERROR LOADING SERVICES]</div>';
    document.getElementById('endpointsList').innerHTML = '<div class="service-item error">[ERROR LOADING ENDPOINTS]</div>';
  }
}

async function fetchAllStats() {
  await Promise.all([fetchSystemStats(), fetchPM2Stats(), fetchServiceStats()]);
  lastUpdate.textContent = new Date().toLocaleTimeString();
}

// Initialize
function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(fetchAllStats, 5000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

refreshToggle.addEventListener('click', () => {
  autoRefresh = !autoRefresh;

  if (autoRefresh) {
    refreshToggle.classList.add('active');
    refreshStatus.textContent = 'ON';
    startAutoRefresh();
  } else {
    refreshToggle.classList.remove('active');
    refreshStatus.textContent = 'OFF';
    stopAutoRefresh();
  }
});

// Start
fetchAllStats();
startAutoRefresh();
JSEOF

echo "[7/7] Installing dependencies and starting PM2..."
cd ${APP_DIR}
npm install

# Stop existing process if running
pm2 delete ${PM2_NAME} 2>/dev/null || true

# Start the app
PORT=${PORT} pm2 start server.js --name ${PM2_NAME}
pm2 save

echo ""
echo "=========================================="
echo " Stats Dashboard deployed successfully!"
echo "=========================================="
echo ""
echo " App running on: http://127.0.0.1:${PORT}"
echo " PM2 process: ${PM2_NAME}"
echo ""
echo " Next steps:"
echo " 1. Update Nginx config for stats.legolasan.in"
echo " 2. Reload Nginx: sudo systemctl reload nginx"
echo " 3. Test: curl http://127.0.0.1:${PORT}/health"
echo ""
ENDSSH

echo ""
echo "Deployment complete! Now update Nginx configuration."
