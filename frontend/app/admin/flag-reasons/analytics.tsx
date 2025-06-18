'use client';

// Analytics page visualizing why summaries are flagged most often

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchFlagReasonAnalytics, FlagReasonUsage } from '../../../services/flagReasonAnalyticsService';
import { getFlagReasons } from '../../../services/apiClient';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface ReasonRow {
  id: string;
  label: string;
  category?: string | null;
}

export default function FlagReasonAnalyticsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<FlagReasonUsage[]>([]);
  const [reasons, setReasons] = useState<ReasonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const load = async () => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const analytics = await fetchFlagReasonAnalytics(
        start || undefined,
        end || undefined
      );
      const reasonList = await getFlagReasons(token);
      setRows(analytics);
      setReasons(reasonList);
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categoryLookup = Object.fromEntries(
    reasons.map((r) => [r.label, r.category])
  ) as Record<string, string | undefined>;

  const colorFor = (cat?: string | null) => {
    const colors: Record<string, string> = {
      Safety: '#f87171',
      Quality: '#60a5fa',
      Relevance: '#4ade80'
    };
    return colors[cat || ''] || '#a3a3a3';
  };

  const chartData = rows.map((r) => ({
    reason: r.reason,
    count: r.count,
    category: categoryLookup[r.reason]
  }));

  const applyFilters = () => {
    load();
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Flag Reason Analytics</h1>
      <div className="flex gap-2 items-end">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border p-1 rounded"
        />
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border p-1 rounded"
        />
        <button onClick={applyFilters} className="px-3 py-1 border rounded">
          Apply
        </button>
      </div>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No flag data.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="w-full max-w-4xl space-y-4">
          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="reason" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorFor(entry.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2 text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.reason} className="odd:bg-gray-100">
                    <td className="border px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          categoryLookup[r.reason]
                            ? colorFor(categoryLookup[r.reason])
                            : '#f3f4f6'
                        } text-white`}
                      >
                        {r.reason}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-right">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
