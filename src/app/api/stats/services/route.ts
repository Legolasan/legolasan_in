import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimiters, getClientIP } from '@/lib/rateLimit';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Cache service stats for 30 seconds
let cachedServiceStats: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds

interface ServiceStatus {
  name: string;
  status: 'active' | 'inactive' | 'unknown';
  uptime?: string;
}

interface EndpointHealth {
  url: string;
  status: number;
  responseTime: number;
  healthy: boolean;
}

async function checkSystemService(serviceName: string): Promise<ServiceStatus> {
  try {
    const { stdout } = await execAsync(`systemctl is-active ${serviceName} 2>/dev/null || echo "inactive"`);
    const isActive = stdout.trim() === 'active';

    if (isActive) {
      try {
        const { stdout: statusOutput } = await execAsync(`systemctl status ${serviceName} 2>/dev/null | grep "Active:" || echo ""`);
        const uptimeMatch = statusOutput.match(/since (.+?);/);
        const uptime = uptimeMatch ? uptimeMatch[1] : undefined;

        return {
          name: serviceName,
          status: 'active',
          uptime,
        };
      } catch {
        return {
          name: serviceName,
          status: 'active',
        };
      }
    }

    return {
      name: serviceName,
      status: 'inactive',
    };
  } catch (error) {
    return {
      name: serviceName,
      status: 'unknown',
    };
  }
}

async function checkEndpointHealth(url: string): Promise<EndpointHealth> {
  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'Stats-Monitor' },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    return {
      url,
      status: response.status,
      responseTime,
      healthy: response.status >= 200 && response.status < 400,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      url,
      status: 0,
      responseTime,
      healthy: false,
    };
  }
}

async function getServiceStats() {
  const now = Date.now();

  // Return cached stats if still valid
  if (cachedServiceStats && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedServiceStats;
  }

  // Check system services
  const services = await Promise.all([
    checkSystemService('nginx'),
    checkSystemService('postgresql'),
    checkSystemService('mariadb'),
  ]);

  // Check application endpoints
  const endpoints = await Promise.all([
    checkEndpointHealth('http://127.0.0.1:3000'),
    checkEndpointHealth('http://127.0.0.1:5001'),
    checkEndpointHealth('http://127.0.0.1:5003'),
  ]);

  const stats = {
    services,
    endpoints,
    timestamp: new Date().toISOString(),
  };

  // Cache the stats
  cachedServiceStats = stats;
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

    const stats = await getServiceStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching service stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service stats' },
      { status: 500 }
    );
  }
}
