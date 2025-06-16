'use client';
// Admin page listing reminder delivery logs with basic filtering and sorting

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchReminderLogs, ReminderLogRecord } from '../../../services/reminderService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function ReminderLogsPage() {
  const router = useRouter(); // Notes: Router for redirects on auth failure
  // Notes: Local state storing retrieved reminder logs
  const [logs, setLogs] = useState<ReminderLogRecord[]>([]);
  // Notes: Flags for UI state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortAsc, setSortAsc] = useState(false);
  // Notes: Date range inputs currently unused but kept for future filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Notes: Validate session and fetch logs when the component mounts
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
        // Notes: Retrieve reminder logs from the service layer
        const data = await fetchReminderLogs();
        setLogs(data);
      } catch {
        // Notes: Display a friendly error message on failure
        setError('Unable to fetch reminder logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Apply status and date range filters
  const filtered = logs.filter((log) => {
    if (statusFilter !== 'ALL' && log.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (startDate && new Date(log.sent_at) < new Date(startDate)) return false;
    if (endDate && new Date(log.sent_at) > new Date(endDate)) return false;
    return true;
  });

  // Notes: Sort filtered logs by sent_at date
  const sorted = [...filtered].sort((a, b) => {
    const t1 = new Date(a.sent_at).getTime();
    const t2 = new Date(b.sent_at).getTime();
    return sortAsc ? t1 - t2 : t2 - t1;
  });

  // Notes: Toggle sort direction when header is clicked
  const toggleSort = () => setSortAsc((prev) => !prev);

  // Notes: Format ISO timestamps for readability
  const fmt = (d: string) => new Date(d).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Reminder Logs</h1>
      {/* Filter controls */}
      <div className="flex space-x-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="ALL">All</option>
          <option value="SUCCESS">Success</option>
          <option value="ERROR">Error</option>
        </select>
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
      {/* Loading, error and empty states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && sorted.length === 0 && <p>No reminder logs found.</p>}
      {/* Table of reminder logs */}
      {!loading && !error && sorted.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Subscription ID</th>
                <th className="px-4 py-2 cursor-pointer select-none" onClick={toggleSort}>
                  Sent {sortAsc ? '▲' : '▼'}
                </th>
                <th className="px-4 py-2">Renew Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((log, idx) => (
                <tr key={idx} className="odd:bg-gray-100">
                  <td className="border px-4 py-2 break-all">{log.user_email}</td>
                  <td className="border px-4 py-2 break-all">{log.subscription_id}</td>
                  <td className="border px-4 py-2">{fmt(log.sent_at)}</td>
                  <td className="border px-4 py-2">{fmt(log.renew_date)}</td>
                  <td className="border px-4 py-2 capitalize">{log.status}</td>
                  <td className="border px-4 py-2 break-all">
                    {log.error_message || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
