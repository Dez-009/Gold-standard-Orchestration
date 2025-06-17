'use client';
// Admin-only page summarizing application analytics

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAdminAnalyticsSummary, AnalyticsSummary } from '../../../services/adminAnalyticsService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function AdminAnalyticsPage() {
  const router = useRouter(); // Notes: Used for redirecting on auth failure
  // Notes: Hold summary data returned from the backend
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true); // Loading state for spinner
  const [error, setError] = useState(''); // Error message string

  // Notes: Fetch the analytics summary after validating the session
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
        const data = await fetchAdminAnalyticsSummary();
        setSummary(data);
      } catch {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Prepare chart data when summary is available
  const chartData = summary?.events_daily.map((d) => ({
    date: d.period,
    count: d.count
  })) ?? [];

  // Notes: Sort event types by count descending for display
  const eventTypes = summary
    ? Object.entries(summary.events_by_type).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Analytics Summary</h1>
      {/* Loading and error states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && summary && (
        <>
          <div className="text-xl font-semibold">Total Events: {summary.total_events}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-2">Top Event Types</h2>
              <ul className="space-y-1">
                {eventTypes.map(([type, count]) => (
                  <li key={type} className="flex justify-between">
                    <span>{type}</span>
                    <span>{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-2">Events Over Time</h2>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
      {!loading && !error && !summary && <p>No analytics data available.</p>}
    </div>
  );
}
