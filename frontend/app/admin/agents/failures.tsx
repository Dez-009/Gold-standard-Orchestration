'use client';
// Admin page showing final agent failure logs for investigation

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAgentFailureLogs, AgentFailureLog } from '../../../services/agentFailureLogService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AgentFailureLogsPage() {
  const router = useRouter();
  // Notes: Local state for failure logs and UI flags
  const [rows, setRows] = useState<AgentFailureLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  // Notes: Load logs on mount
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
        const data = await fetchAgentFailureLogs();
        setRows(data.results);
      } catch {
        setError('Failed to load failures');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Format timestamp for readability
  const fmt = (iso: string) => new Date(iso).toLocaleString();
  const filtered = rows.filter((r) =>
    filter ? r.agent_name.includes(filter) : true
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Agent Failure Logs</h1>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by agent"
        className="border p-1 rounded"
      />
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>No failures found.</p>}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{r.user_id}</td>
                  <td className="border px-4 py-2">{r.agent_name}</td>
                  <td className="border px-4 py-2 max-w-xs truncate">
                    {r.reason}
                  </td>
                  <td className="border px-4 py-2">
                    {fmt(r.failed_at)}
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

// Footnote: Alerts with red background will highlight critical failures.

