'use client';
// Notes: Display system health status information for administrators
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchSystemHealth } from '../../../services/systemService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface HealthData {
  api: string;
  database: string;
  ai: string;
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
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await fetchSystemHealth();
        setData(resp);
      } catch {
        setError('Failed to load system health');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Helper to render a colored badge based on service status
  const badge = (ok: boolean, text: string) => (
    <span className={`px-2 py-1 rounded text-white ${ok ? 'bg-green-600' : 'bg-red-600'}`}>{text}</span>
  );

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
      {data && (
        <div className="space-y-2">
          <div>
            <span className="font-semibold mr-2">API Status:</span>
            {badge(data.api === 'up', data.api)}
          </div>
          <div>
            <span className="font-semibold mr-2">Database Status:</span>
            {badge(data.database === 'connected', data.database)}
          </div>
          <div>
            <span className="font-semibold mr-2">AI Service Status:</span>
            {badge(data.ai === 'responding', data.ai)}
          </div>
        </div>
      )}
    </div>
  );
}
