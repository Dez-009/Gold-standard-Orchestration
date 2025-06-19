'use client';
// Admin page listing agent execution history

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAgentExecutionLogs, AgentExecutionRecord } from '../../../services/agentExecutionLogService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AgentExecutionLogPage() {
  const router = useRouter();
  // Notes: Local state for logs and form controls
  const [logs, setLogs] = useState<AgentExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agentName, setAgentName] = useState('');
  const [success, setSuccess] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Notes: Load logs whenever filters or pagination change
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
        const data = await fetchAgentExecutionLogs({
          agent_name: agentName || undefined,
          success: success ? success === 'true' : undefined,
          limit,
          offset
        });
        setLogs(data);
      } catch {
        setError('Failed to load agent logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, agentName, success, offset]);

  // Notes: Format timestamp for table display
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back navigation */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Agent Execution Logs</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Agent"
          className="border p-1 rounded"
        />
        <select
          value={success}
          onChange={(e) => setSuccess(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="">All</option>
          <option value="true">Success</option>
          <option value="false">Failure</option>
        </select>
        <button onClick={() => setOffset(0)} className="px-3 py-1 border rounded">
          Apply
        </button>
      </div>
      {/* Loading and error states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>No logs found.</p>}
      {/* Table */}
      {!loading && !error && logs.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Success</th>
                <th className="px-4 py-2">Time ms</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{fmt(log.created_at)}</td>
                  <td className="border px-4 py-2">{log.user_id}</td>
                  <td className="border px-4 py-2">{log.agent_name}</td>
                  <td className="border px-4 py-2">{log.success ? 'Yes' : 'No'}</td>
                  <td className="border px-4 py-2">{log.execution_time_ms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
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

// Footnote: Admin React page for viewing agent execution telemetry.
