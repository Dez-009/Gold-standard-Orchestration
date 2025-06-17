'use client';
// Admin page displaying orchestration performance metrics

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOrchestrationLogs } from '../../../services/apiClient';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface PerfLog {
  id: string;
  agent_name: string;
  user_id: number;
  execution_time_ms: number;
  input_tokens: number;
  output_tokens: number;
  status: string;
  fallback_triggered: boolean;
  timestamp: string;
}

export default function OrchestrationPerformancePage() {
  const router = useRouter();
  // Notes: Store retrieved logs in component state
  const [logs, setLogs] = useState<PerfLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Notes: Pagination parameters
  const [skip, setSkip] = useState(0);
  const limit = 20;

  // Notes: Load logs when page mounts or pagination changes
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
        const data = await getOrchestrationLogs(token, limit, skip);
        setLogs(data);
      } catch {
        setError('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, skip]);

  const fmt = (iso: string) => new Date(iso).toLocaleString();
  const badge = (status: string) => {
    const color =
      status === 'success'
        ? 'bg-green-200'
        : status === 'failed'
        ? 'bg-red-200'
        : 'bg-yellow-200';
    return <span className={`px-2 py-1 rounded ${color}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Orchestration Performance Logs</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>No logs found.</p>}
      {!loading && !error && logs.length > 0 && (
        <div className="overflow-x-auto w-full max-h-[70vh]">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Exec ms</th>
                <th className="px-4 py-2">In</th>
                <th className="px-4 py-2">Out</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Fallback</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="odd:bg-gray-100 text-center">
                  <td className="border px-2 py-1">{fmt(log.timestamp)}</td>
                  <td className="border px-2 py-1">{log.agent_name}</td>
                  <td className="border px-2 py-1">{log.execution_time_ms}</td>
                  <td className="border px-2 py-1">{log.input_tokens}</td>
                  <td className="border px-2 py-1">{log.output_tokens}</td>
                  <td className="border px-2 py-1">{badge(log.status)}</td>
                  <td className="border px-2 py-1">
                    {log.fallback_triggered ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && (
        <div className="flex space-x-4">
          <button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setSkip(skip + limit)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// Footnote: Presents orchestration performance telemetry for admins.
