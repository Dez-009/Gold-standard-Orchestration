'use client';
// Notes: Display system health status information for administrators
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchSystemHealth } from '../../../services/systemHealthService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface HealthData {
  database: string;
  ai: string;
  disk_space: string;
  uptime: string;
  memory_usage: string;
  cpu_usage: string;
  load_average: string;
  active_connections: string;
  environment: string;
  version: string;
  timestamp: string;
}

export default function HealthPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Notes: Local state for the health payload and loading indicators
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Notes: Verify session and fetch health info on mount
  useEffect(() => {
    const token = getToken();
    // Notes: Verify authentication and admin role before fetching data
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    loadHealthData();
  }, [router]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadHealthData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadHealthData = async () => {
    setLoading(true);
    setError('');
    try {
      // Notes: Request the latest system health information
      const resp = await fetchSystemHealth();
      setData(resp);
    } catch {
      // Notes: Show a friendly error when the request fails
      setError('Unable to fetch system health');
    } finally {
      setLoading(false);
    }
  };

  // Notes: Helper to render a colored badge based on service status
  // Notes: Render a color coded badge with a check or cross icon
  const badge = (ok: boolean, text?: string) => (
    <span className={`px-2 py-1 rounded text-white ${ok ? 'bg-green-600' : 'bg-red-600'}`}>
      {ok ? '✅' : '❌'} {text || (ok ? 'Healthy' : 'Unhealthy')}
    </span>
  );

  // Notes: Determine if a service string indicates healthy state
  const isHealthy = (status: string) => {
    return ['ok', 'up', 'connected', 'available', 'responding', 'healthy'].includes(status.toLowerCase());
  };

  // Helper to get status color for different metrics
  const getStatusColor = (value: string) => {
    if (value.includes('Unknown') || value.includes('error')) return 'text-red-600';
    if (value.includes('no_key')) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Helper to format metric display
  const MetricCard = ({ title, value, status = 'normal' }: { title: string; value: string; status?: 'normal' | 'warning' | 'error' }) => {
    const getStatusClass = () => {
      switch (status) {
        case 'error': return 'border-red-200 bg-red-50';
        case 'warning': return 'border-yellow-200 bg-yellow-50';
        default: return 'border-gray-200 bg-white';
      }
    };

    return (
      <div className={`p-4 rounded-lg border ${getStatusClass()} shadow-sm`}>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className={`text-lg font-semibold ${getStatusColor(value)}`}>{value}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-6">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard" className="text-blue-600 underline">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadHealthData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto-refresh (30s)</span>
            </label>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">System Health Dashboard</h1>
        <p className="text-gray-600 mb-6">Real-time system status and performance metrics</p>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* Core Services Status */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Core Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard
                  title="Database Status"
                  value={isHealthy(data.database) ? 'Connected' : 'Disconnected'}
                  status={isHealthy(data.database) ? 'normal' : 'error'}
                />
                <MetricCard
                  title="AI Service Status"
                  value={data.ai === 'no_key' ? 'No API Key' : (isHealthy(data.ai) ? 'Available' : 'Unavailable')}
                  status={data.ai === 'no_key' ? 'warning' : (isHealthy(data.ai) ? 'normal' : 'error')}
                />
              </div>
            </div>

            {/* System Resources */}
            <div>
              <h2 className="text-xl font-semibold mb-4">System Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Memory Usage" value={data.memory_usage} />
                <MetricCard title="CPU Usage" value={data.cpu_usage} />
                <MetricCard title="Disk Space" value={data.disk_space} />
                <MetricCard title="Active Connections" value={data.active_connections} />
              </div>
            </div>

            {/* System Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">System Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Server Uptime" value={data.uptime} />
                <MetricCard title="Load Average" value={data.load_average} />
                <MetricCard title="Environment" value={data.environment} />
                <MetricCard title="Version" value={data.version} />
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-sm text-gray-500">
              Last updated: {new Date(data.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
