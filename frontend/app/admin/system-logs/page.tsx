'use client';
// Admin page to view system logs with level filtering

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchSystemLogs } from '../../../services/systemLogService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

// Shape of a system log record returned by the backend
interface SystemLog {
  timestamp: string;
  level: string;
  source: string;
  message: string;
}

export default function SystemLogsPage() {
  const router = useRouter(); // Router used for redirects
  // Local state for logs, loading flag, error message and filter level
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [level, setLevel] = useState('ALL');

  // Validate session and fetch logs on mount
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
        // Request system logs from the backend service
        const data = await fetchSystemLogs();
        setLogs(data);
      } catch {
        // Show a user friendly error message on failure
        setError('Failed to load system logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Filter logs based on the selected level
  const filtered = logs.filter((log) =>
    level === 'ALL' ? true : log.level === level
  );

  // Helper to color-code levels using Tailwind classes
  const levelColor = (lvl: string) => {
    switch (lvl) {
      case 'ERROR':
        return 'text-red-600';
      case 'WARNING':
        return 'text-yellow-600';
      case 'INFO':
        return 'text-green-600';
      default:
        return '';
    }
  };

  // Format ISO timestamp into readable local string
  const fmt = (t: string) => new Date(t).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading and filter dropdown */}
      <h1 className="text-2xl font-bold">System Logs</h1>
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="ALL">All Levels</option>
        <option value="INFO">Info</option>
        <option value="WARNING">Warning</option>
        <option value="ERROR">Error</option>
      </select>
      {/* Conditional rendering states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>No logs found.</p>}
      {/* Table of logs when available */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto w-full max-h-[70vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Level</th>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, idx) => (
                <tr key={idx} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{fmt(log.timestamp)}</td>
                  <td className={`border px-4 py-2 ${levelColor(log.level)}`}>{log.level}</td>
                  <td className="border px-4 py-2">{log.source}</td>
                  <td className="border px-4 py-2 whitespace-pre-wrap">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
