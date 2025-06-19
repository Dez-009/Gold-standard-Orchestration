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
  timestamp: string;
}

export default function HealthPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Notes: Local state for the health payload and loading indicators
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    const load = async () => {
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
    load();
  }, [router]);

  // Notes: Helper to render a colored badge based on service status
  // Notes: Render a color coded badge with a check or cross icon
  const badge = (ok: boolean) => (
    <span className={`px-2 py-1 rounded text-white ${ok ? 'bg-green-600' : 'bg-red-600'}`}>{ok ? '✅ Healthy' : '❌ Unhealthy'}</span>
  );

  // Notes: Determine if a service string indicates healthy state
  const isHealthy = (status: string) => {
    return ['ok', 'up', 'connected', 'available', 'responding', 'healthy'].includes(status.toLowerCase());
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">System Health</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {data && !loading && (
        <div className="space-y-2">
          {/* Notes: Database connection status */}
          <div>
            <span className="font-semibold mr-2">Database Status:</span>
            {badge(isHealthy(data.database))}
          </div>
          {/* Notes: AI service health */}
          <div>
            <span className="font-semibold mr-2">AI Service Status:</span>
            {badge(isHealthy(data.ai))}
          </div>
          {/* Notes: Disk space placeholder */}
          <div>
            <span className="font-semibold mr-2">Disk Space:</span>
            <span>{data.disk_space || 'N/A'}</span>
          </div>
          {/* Notes: Server uptime placeholder */}
          <div>
            <span className="font-semibold mr-2">Uptime:</span>
            <span>{data.uptime || 'N/A'}</span>
          </div>
          {/* Notes: Timestamp when health was checked */}
          <div>
            <span className="font-semibold mr-2">Checked At:</span>
            <span>{new Date(data.timestamp).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
