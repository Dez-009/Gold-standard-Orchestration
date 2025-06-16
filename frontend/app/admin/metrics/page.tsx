'use client';
// Admin page displaying overall system metrics in card format

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchSystemMetrics } from '../../../services/metricsService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

// Shape of the metrics object returned by the backend
interface MetricsData {
  active_users: number;
  total_subscriptions: number;
  load_average: number;
  job_queue_depth: number;
  api_request_count: number;
}

export default function MetricsPage() {
  const router = useRouter(); // Notes: Router used for authentication redirects
  // Notes: Local state for metrics, loading flag and error message
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notes: Verify admin session and load metrics on mount
  useEffect(() => {
    const token = getToken();
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
        // Notes: Request real-time metrics from the backend service
        const resp = await fetchSystemMetrics();
        setData(resp);
      } catch {
        // Notes: Show a friendly message when the request fails
        setError('Unable to fetch system metrics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Helper component for a colored metric card
  const MetricCard = ({ label, value }: { label: string; value: number }) => (
    <div className="border rounded p-4 shadow-md flex flex-col items-center">
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      <span className="text-2xl font-bold text-blue-600">{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">System Metrics</h1>
      {/* Loading spinner and error message handling */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {/* Show message if no data is available */}
      {!loading && !error && !data && <p>No metrics available.</p>}
      {/* Metrics grid when data is present */}
      {!loading && !error && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          <MetricCard label="Active Users" value={data.active_users} />
          <MetricCard label="Subscriptions" value={data.total_subscriptions} />
          <MetricCard label="Load Average" value={data.load_average} />
          <MetricCard label="Job Queue Depth" value={data.job_queue_depth} />
          <MetricCard label="API Requests" value={data.api_request_count} />
        </div>
      )}
    </div>
  );
}
