'use client';
// Admin page showing behavioral insights per user

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchBehavioralInsights, BehavioralInsight } from '../../../services/behavioralInsightService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function BehavioralInsightsPage() {
  const router = useRouter();
  // Notes: Track form input and retrieved insights
  const [userId, setUserId] = useState('');
  const [insights, setInsights] = useState<BehavioralInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Notes: Ensure the visitor is an authenticated admin
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  const loadInsights = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchBehavioralInsights(Number(userId));
      setInsights(data);
    } catch {
      setError('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d: string) => new Date(d).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Behavioral Insights</h1>
      <div className="flex space-x-2 w-full max-w-sm">
        <input
          type="number"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={loadInsights}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Load
        </button>
      </div>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && insights.length === 0 && <p>No insights found.</p>}
      {!loading && !error && insights.length > 0 && (
        <div className="overflow-x-auto w-full max-w-2xl">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Text</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {insights.map((i) => (
                <tr key={i.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{i.id}</td>
                  <td className="border px-4 py-2 whitespace-pre-wrap">{i.insight_text}</td>
                  <td className="border px-4 py-2 capitalize">{i.insight_type}</td>
                  <td className="border px-4 py-2">{fmt(i.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
