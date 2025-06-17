'use client';
// Admin dashboard page displaying aggregated behavioral insights

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchBehavioralInsights, BehavioralInsightsData } from '../../../services/behavioralInsightsService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function BehavioralInsightsPage() {
  const router = useRouter();
  // Notes: Store the metrics returned from the backend
  const [data, setData] = useState<BehavioralInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notes: Helper that fetches the insights once authentication is verified
  const loadInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchBehavioralInsights();
      setData(result);
    } catch {
      setError('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  // Notes: Ensure the visitor is an authenticated admin
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    } else {
      // Notes: Fetch insights once admin authentication is confirmed
      loadInsights();
    }
  }, [router]);

  // Notes: Helper used to render the metrics table
  const renderTable = () => (
    <table className="min-w-full text-sm">
      <thead>
        <tr>
          <th className="px-2 py-1">User ID</th>
          <th className="px-2 py-1">Check-ins</th>
        </tr>
      </thead>
      <tbody>
        {data?.top_active_users.map((u) => (
          <tr key={u.user_id} className="odd:bg-gray-100">
            <td className="border px-2 py-1">{u.user_id}</td>
            <td className="border px-2 py-1">{u.checkins}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Behavioral Insights</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && data && (
        <div className="w-full max-w-xl space-y-4">
          <div className="bg-white rounded shadow p-4">
            <p className="font-medium">Average Check-ins / Week:</p>
            <p>{data.avg_checkins_per_week.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <p className="font-medium">Journal Entries:</p>
            <p>{data.journal_entries}</p>
          </div>
          <div className="bg-white rounded shadow p-4 overflow-x-auto">
            <p className="font-medium mb-2">Top Active Users</p>
            {renderTable()}
          </div>
          <p className="italic text-center">{data.ai_summary}</p>
        </div>
      )}
      {!loading && !error && !data && <p>No insights available.</p>}
    </div>
  );
}
