'use client';
/**
 * Admin page displaying the system audit logs.
 * Allows filtering by user, agent and date range.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAuditLogs } from '../../../services/auditLogService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface AuditLogRow {
  timestamp: string;
  action_type: string;
  metadata: string | null;
  user_id: number | null;
}

export default function AuditLogsPage() {
  const router = useRouter();
  // Notes: Local state for rows and UI controls
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [agentName, setAgentName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  // Notes: Load data whenever filters change
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
        const data = await fetchAuditLogs({
          user_id: userId || undefined,
          agent_name: agentName || undefined,
          start_date: start || undefined,
          end_date: end || undefined
        });
        setLogs(data);
      } catch {
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, userId, agentName, start, end]);

  // Notes: Format timestamp for display
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          className="border p-1 rounded"
        />
        <input
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Agent"
          className="border p-1 rounded"
        />
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
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Metadata</th>
                <th className="px-4 py-2">User</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{fmt(log.timestamp)}</td>
                  <td className="border px-4 py-2">{agentName || '-'}</td>
                  <td className="border px-4 py-2">{log.action_type}</td>
                  <td className="border px-4 py-2">
                    <span className="block max-w-xs truncate hover:whitespace-normal">
                      {log.metadata}
                    </span>
                  </td>
                  <td className="border px-4 py-2">{log.user_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Footnote: React page enabling admins to inspect audit trail entries.
