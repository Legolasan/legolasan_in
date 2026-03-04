import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimiters, getClientIP } from '@/lib/rateLimit';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Cache PM2 stats for 2 seconds (processes change frequently)
let cachedPM2Stats: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 2000; // 2 seconds

interface PM2Process {
  pm_id: number;
  name: string;
  status: string;
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
  pid: number;
}

async function getPM2Stats(): Promise<PM2Process[]> {
  const now = Date.now();

  // Return cached stats if still valid
  if (cachedPM2Stats && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedPM2Stats;
  }

  try {
    // Check if pm2 is available
    const { stdout } = await execAsync('pm2 jlist 2>/dev/null || echo "[]"');
    const processes = JSON.parse(stdout);

    const stats: PM2Process[] = processes.map((proc: any) => ({
      pm_id: proc.pm2_env?.pm_id ?? proc.pm_id ?? 0,
      name: proc.name || 'unknown',
      status: proc.pm2_env?.status || 'unknown',
      cpu: proc.monit?.cpu ?? 0,
      memory: proc.monit?.memory ?? 0,
      uptime: proc.pm2_env?.pm_uptime ? Date.now() - proc.pm2_env.pm_uptime : 0,
      restarts: proc.pm2_env?.restart_time ?? 0,
      pid: proc.pid ?? 0,
    }));

    // Cache the stats
    cachedPM2Stats = stats;
    cacheTimestamp = now;

    return stats;
  } catch (error) {
    console.error('Error fetching PM2 stats:', error);
    // Return empty array if PM2 is not available or command fails
    return [];
  }
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

    const processes = await getPM2Stats();

    return NextResponse.json({ processes });
  } catch (error) {
    console.error('Error in PM2 stats endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PM2 stats' },
      { status: 500 }
    );
  }
}
