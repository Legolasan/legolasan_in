'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiHardDrive, FiActivity, FiServer, FiRefreshCw, FiPower } from 'react-icons/fi';
import { BsMemory } from 'react-icons/bs';

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
}

interface PM2Process {
  pm_id: number;
  name: string;
  status: string;
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
}

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

// Note: This page is protected by Cloudflare Zero Trust at the subdomain level
// No NextAuth authentication required here

export default function StatsPage() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [pm2Stats, setPm2Stats] = useState<PM2Process[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/stats/system');
      if (response.ok) {
        const data = await response.json();
        setSystemStats(data);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const fetchPM2Stats = async () => {
    try {
      const response = await fetch('/api/stats/pm2');
      if (response.ok) {
        const data = await response.json();
        setPm2Stats(data.processes || []);
      }
    } catch (error) {
      console.error('Error fetching PM2 stats:', error);
    }
  };

  const fetchServiceStats = async () => {
    try {
      const response = await fetch('/api/stats/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
        setEndpoints(data.endpoints || []);
      }
    } catch (error) {
      console.error('Error fetching service stats:', error);
    }
  };

  const fetchAllStats = async () => {
    await Promise.all([fetchSystemStats(), fetchPM2Stats(), fetchServiceStats()]);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAllStats();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-[#00ff41] font-mono text-xl animate-pulse">
          [LOADING SYSTEM STATS...]
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getProgressBar = (percent: number, width: number = 20) => {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return 'text-[#00ff41]';
      case 'stopped':
      case 'inactive':
        return 'text-red-500';
      case 'errored':
        return 'text-red-600';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusSymbol = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return '[✓]';
      case 'stopped':
      case 'inactive':
        return '[✗]';
      case 'errored':
        return '[!]';
      default:
        return '[?]';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-[#00ff41] font-mono p-6">
      {/* Header */}
      <div className="border-2 border-[#00ff41] p-4 mb-6 shadow-[0_0_10px_rgba(0,255,65,0.3)]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl mb-1">╔═══════════════════════════════════════╗</h1>
            <h1 className="text-2xl">║  SYSTEM STATUS MONITOR v1.0.0         ║</h1>
            <h1 className="text-2xl">╚═══════════════════════════════════════╝</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 border-2 ${
                autoRefresh ? 'border-[#00ff41] text-[#00ff41]' : 'border-gray-600 text-gray-600'
              } hover:shadow-[0_0_10px_rgba(0,255,65,0.5)] transition-all flex items-center gap-2`}
            >
              <FiRefreshCw className={autoRefresh ? 'animate-spin' : ''} />
              AUTO-REFRESH [{autoRefresh ? 'ON' : 'OFF'}]
            </button>
            <div className="text-[#00d9ff] text-sm">
              LAST UPDATE: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* CPU */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-[#00ff41] p-4 shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <FiCpu className="text-xl" />
            <div className="text-lg">CPU USAGE</div>
          </div>
          <div className="text-3xl mb-2">{systemStats?.cpu.usage.toFixed(1)}%</div>
          <div className="text-sm mb-2">
            [{getProgressBar(systemStats?.cpu.usage || 0)}] {systemStats?.cpu.usage.toFixed(1)}%
          </div>
          <div className="text-xs text-[#00d9ff] space-y-1">
            <div>CORES: {systemStats?.cpu.cores}</div>
            <div>LOAD: {systemStats?.cpu.loadAvg.map(l => l.toFixed(2)).join(', ')}</div>
          </div>
        </motion.div>

        {/* Memory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-2 border-[#00ff41] p-4 shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <BsMemory className="text-xl" />
            <div className="text-lg">MEMORY</div>
          </div>
          <div className="text-3xl mb-2">{systemStats?.memory.usagePercent}%</div>
          <div className="text-sm mb-2">
            [{getProgressBar(systemStats?.memory.usagePercent || 0)}] {systemStats?.memory.usagePercent}%
          </div>
          <div className="text-xs text-[#00d9ff] space-y-1">
            <div>USED: {formatBytes(systemStats?.memory.used || 0)}</div>
            <div>TOTAL: {formatBytes(systemStats?.memory.total || 0)}</div>
          </div>
        </motion.div>

        {/* Disk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-2 border-[#00ff41] p-4 shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <FiHardDrive className="text-xl" />
            <div className="text-lg">DISK USAGE</div>
          </div>
          <div className="text-3xl mb-2">{systemStats?.disk.usagePercent}%</div>
          <div className="text-sm mb-2">
            [{getProgressBar(systemStats?.disk.usagePercent || 0)}] {systemStats?.disk.usagePercent}%
          </div>
          <div className="text-xs text-[#00d9ff] space-y-1">
            <div>USED: {formatBytes(systemStats?.disk.used || 0)}</div>
            <div>TOTAL: {formatBytes(systemStats?.disk.total || 0)}</div>
          </div>
        </motion.div>
      </div>

      {/* PM2 Processes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border-2 border-[#00ff41] p-4 mb-6 shadow-[0_0_10px_rgba(0,255,65,0.3)]"
      >
        <div className="flex items-center gap-2 mb-4">
          <FiServer className="text-xl" />
          <div className="text-lg">PM2 PROCESSES</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#00ff41]">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">NAME</th>
                <th className="text-left py-2">STATUS</th>
                <th className="text-right py-2">CPU</th>
                <th className="text-right py-2">MEMORY</th>
                <th className="text-right py-2">UPTIME</th>
                <th className="text-right py-2">RESTARTS</th>
              </tr>
            </thead>
            <tbody>
              {pm2Stats.map((proc, index) => (
                <tr
                  key={index}
                  className="border-b border-[#00ff41]/30 hover:bg-[#00ff41]/10 transition-colors"
                >
                  <td className="py-2">{proc.pm_id}</td>
                  <td className="py-2">{proc.name}</td>
                  <td className={`py-2 ${getStatusColor(proc.status)}`}>
                    {getStatusSymbol(proc.status)} {proc.status.toUpperCase()}
                  </td>
                  <td className="text-right py-2">{proc.cpu.toFixed(1)}%</td>
                  <td className="text-right py-2">{(proc.memory / 1024 / 1024).toFixed(0)}MB</td>
                  <td className="text-right py-2">{formatUptime(Math.floor(proc.uptime / 1000))}</td>
                  <td className="text-right py-2">{proc.restarts}</td>
                </tr>
              ))}
              {pm2Stats.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-yellow-500">
                    [NO PM2 PROCESSES DETECTED]
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-2 border-[#00ff41] p-4 shadow-[0_0_10px_rgba(0,255,65,0.3)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="text-xl" />
            <div className="text-lg">SYSTEM SERVICES</div>
          </div>
          <div className="space-y-2">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 border border-[#00ff41]/30 hover:bg-[#00ff41]/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(service.status)}>{getStatusSymbol(service.status)}</span>
                  <span className="uppercase">{service.name}</span>
                </div>
                <div className="text-xs text-[#00d9ff]">
                  {service.status === 'active' ? service.uptime || 'RUNNING' : 'INACTIVE'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border-2 border-[#00ff41] p-4 shadow-[0_0_10px_rgba(0,255,65,0.3)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiPower className="text-xl" />
            <div className="text-lg">ENDPOINT HEALTH</div>
          </div>
          <div className="space-y-2">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 border border-[#00ff41]/30 hover:bg-[#00ff41]/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={endpoint.healthy ? 'text-[#00ff41]' : 'text-red-500'}>
                    {endpoint.healthy ? '[✓]' : '[✗]'}
                  </span>
                  <span className="text-xs">{endpoint.url}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={endpoint.status === 200 ? 'text-[#00ff41]' : 'text-red-500'}>
                    [{endpoint.status || 'ERR'}]
                  </span>
                  <span className="text-[#00d9ff]">{endpoint.responseTime}ms</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="border-2 border-[#00ff41] p-4 mt-6 shadow-[0_0_10px_rgba(0,255,65,0.3)]"
      >
        <div className="text-lg mb-3">SYSTEM INFO</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-[#00d9ff]">UPTIME:</span>{' '}
            {formatUptime(systemStats?.uptime || 0)}
          </div>
          <div>
            <span className="text-[#00d9ff]">PLATFORM:</span>{' '}
            {systemStats?.cpu.model.substring(0, 40)}...
          </div>
          <div>
            <span className="text-[#00d9ff]">HOSTNAME:</span> legolasan.in
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="text-center mt-6 text-xs text-[#00d9ff]">
        [STATS DASHBOARD] - Refreshing every 5 seconds
      </div>
    </div>
  );
}
