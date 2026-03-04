import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimiters, getClientIP } from '@/lib/rateLimit';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Cache system stats for 5 seconds to avoid hammering the system
let cachedStats: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5000; // 5 seconds

interface SystemStats {
  cpu: {
    usage: number;
    cores: number;
    model: string;
    loadAvg: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  uptime: number;
  platform: string;
  hostname: string;
}

async function getDiskUsage(): Promise<{ total: number; used: number; free: number }> {
  try {
    const { stdout } = await execAsync('df -k / | tail -1');
    const parts = stdout.trim().split(/\s+/);
    const total = parseInt(parts[1]) * 1024; // Convert KB to bytes
    const used = parseInt(parts[2]) * 1024;
    const free = parseInt(parts[3]) * 1024;
    return { total, used, free };
  } catch (error) {
    console.error('Error getting disk usage:', error);
    return { total: 0, used: 0, free: 0 };
  }
}

async function getCPUUsage(): Promise<number> {
  return new Promise((resolve) => {
    const startMeasure = process.cpuUsage();
    const startTime = Date.now();

    setTimeout(() => {
      const elapsed = Date.now() - startTime;
      const endMeasure = process.cpuUsage(startMeasure);
      const totalUsage = (endMeasure.user + endMeasure.system) / 1000; // Convert to ms
      const usage = (totalUsage / elapsed) * 100;
      resolve(Math.min(Math.round(usage * 10) / 10, 100)); // Cap at 100%
    }, 100);
  });
}

async function getSystemStats(): Promise<SystemStats> {
  const now = Date.now();

  // Return cached stats if still valid
  if (cachedStats && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedStats;
  }

  // Get CPU info
  const cpus = os.cpus();
  const cpuUsage = await getCPUUsage();

  // Get memory info
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  // Get disk info
  const disk = await getDiskUsage();

  const stats: SystemStats = {
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

  // Cache the stats
  cachedStats = stats;
  cacheTimestamp = now;

  return stats;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = getClientIP(request);
    const { success } = rateLimiters.standard.check(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const stats = await getSystemStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system stats' },
      { status: 500 }
    );
  }
}
