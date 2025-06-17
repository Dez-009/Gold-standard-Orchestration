'use client';
// Page displaying recent orchestration history for admins

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchOrchestrationLogs, OrchestrationLogRecord } from '../../../services/orchestrationMonitorService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function OrchestrationLogPage() {
  const router = useRouter();
  // Notes: Store the fetched log records
  const [logs, setLogs] = useState<OrchestrationLogRecord[]>([]);
  // Notes: Track loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Notes: Pagination controls
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Notes: Validate admin session then load logs
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
        const data = await fetchOrchestrationLogs(limit, offset);
        setLogs(data);
      } catch {
        setError('Failed to load orchestration logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, offset]);

  // Notes: Format ISO timestamps to a readable string
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  // Notes: Summaries of the full_response field for table display
  const summarize = (log: OrchestrationLogRecord) => {
    try {
      const responses = JSON.parse(log.full_response);
      const first = responses[0]?.response ?? '';
      return first.length > 60 ? `${first.slice(0, 57)}...` : first;
    } catch {
      return log.full_response.slice(0, 60);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Orchestration Logs</h1>

      {/* Loading indicator and error message */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>No logs found.</p>}

      {/* Table of orchestration sessions */}
      {!loading && !error && logs.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Prompt</th>
                <th className="px-4 py-2">Agents</th>
                <th className="px-4 py-2">First Response</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{fmt(log.timestamp)}</td>
                  <td className="border px-4 py-2">{log.user_id}</td>
                  <td className="border px-4 py-2 max-w-xs truncate">{log.user_prompt}</td>
                  <td className="border px-4 py-2">{log.agents_invoked}</td>
                  <td className="border px-4 py-2 max-w-xs truncate">{summarize(log)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {!loading && !error && (
        <div className="flex space-x-4">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setOffset(offset + limit)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
