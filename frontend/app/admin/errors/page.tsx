'use client';
// Admin-only page displaying captured application errors in a table

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchErrorLogs, ErrorLogRecord } from '../../../services/errorMonitoringService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function ErrorMonitoringPage() {
  const router = useRouter(); // Notes: Router used for redirects on auth failure
  // Notes: Local state tracking the list of error logs
  const [logs, setLogs] = useState<ErrorLogRecord[]>([]);
  // Notes: Loading and error message flags for user feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Notes: Date range filter placeholders - not yet wired to the backend
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Notes: Validate admin session then fetch logs when page mounts
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
        // Notes: Request the latest error logs from the backend service
        const data = await fetchErrorLogs();
        setLogs(data);
      } catch {
        // Notes: Display a friendly error toast and message
        setError('Unable to fetch error logs');
        showError('Failed to load errors');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Helper to format timestamps for display
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  // Notes: Apply a simple color badge based on error type
  const badge = (type: string) => {
    const color =
      type === 'ValidationError'
        ? 'bg-yellow-500'
        : type === 'Exception'
        ? 'bg-red-600'
        : 'bg-gray-500';
    return (
      <span className={`px-2 py-1 rounded text-white ${color}`}>{type}</span>
    );
  };

  // Notes: Filter logs based on selected date range when provided
  const filtered = logs.filter((log) => {
    if (startDate && new Date(log.timestamp) < new Date(startDate)) return false;
    if (endDate && new Date(log.timestamp) > new Date(endDate)) return false;
    return true;
  });

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Error Monitoring</h1>
      {/* Placeholder date range filters */}
      <div className="flex space-x-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
      {/* Loading spinner, error message and empty state handling */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>No errors found.</p>}
      {/* Render table of error logs when data is available */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Route</th>
                <th className="px-4 py-2">Request ID</th>
                <th className="px-4 py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, idx) => (
                <tr key={idx} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{fmt(log.timestamp)}</td>
                  <td className="border px-4 py-2">{badge(log.type)}</td>
                  <td className="border px-4 py-2">{log.route}</td>
                  <td className="border px-4 py-2">{log.request_id ?? 'N/A'}</td>
                  <td className="border px-4 py-2 max-w-xs truncate">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
