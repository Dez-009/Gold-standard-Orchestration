'use client';
// Admin page displaying aggregated token costs

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAgentCostTotals, AgentCostTotals } from '../../../services/agentCostService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AgentCostPage() {
  const router = useRouter();
  const [data, setData] = useState<AgentCostTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const resp = await fetchAgentCostTotals();
        setData(resp);
      } catch {
        setError('Failed to load costs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Agent Token Costs</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && data && (
        <>
          <div className="flex space-x-4">
            <div className="border rounded p-4 shadow-md flex flex-col items-center">
              <span className="text-sm font-semibold text-gray-600">Total Tokens</span>
              <span className="text-2xl font-bold text-blue-600">{data.total_tokens}</span>
            </div>
            <div className="border rounded p-4 shadow-md flex flex-col items-center">
              <span className="text-sm font-semibold text-gray-600">Total Cost</span>
              <span className="text-2xl font-bold text-blue-600">${data.total_cost}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            <div>
              <h2 className="font-semibold mb-2">Daily Totals</h2>
              <table className="min-w-full border divide-y divide-gray-200 text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Day</th>
                    <th className="px-4 py-2">Tokens</th>
                    <th className="px-4 py-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.daily.map((d) => (
                    <tr key={d.period} className="odd:bg-gray-100 text-center">
                      <td className="border px-2 py-1">{d.period}</td>
                      <td className="border px-2 py-1">{d.tokens}</td>
                      <td className="border px-2 py-1">${d.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h2 className="font-semibold mb-2">Weekly Totals</h2>
              <table className="min-w-full border divide-y divide-gray-200 text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Week</th>
                    <th className="px-4 py-2">Tokens</th>
                    <th className="px-4 py-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.weekly.map((w) => (
                    <tr key={w.period} className="odd:bg-gray-100 text-center">
                      <td className="border px-2 py-1">{w.period}</td>
                      <td className="border px-2 py-1">{w.tokens}</td>
                      <td className="border px-2 py-1">${w.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Footnote: Displays backend aggregated cost metrics for admins.
