'use client';
// Admin page displaying recent audit logs in a sortable table

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAuditLogs } from '../../../services/auditService';

// Define the expected shape of an audit log record
interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  metadata: string | null;
  created_at: string;
}

export default function AuditLogsPage() {
  // Hold the list of logs returned from the backend
  const [logs, setLogs] = useState<AuditLog[]>([]);
  // Track loading, error and sort state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  // Fetch audit logs once when the page mounts
  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAuditLogs();
        setLogs(data);
      } catch {
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  // Toggle the timestamp sort order between ascending and descending
  const toggleSort = () => setSortAsc((prev) => !prev);

  // Sort the logs based on the timestamp field
  const sortedLogs = [...logs].sort((a, b) =>
    sortAsc
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Format ISO timestamps into a readable date string
  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      {/* Show spinner, error message or empty state accordingly */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>No audit logs found.</p>}

      {/* Render the table when logs are available */}
      {!loading && !error && logs.length > 0 && (
        <table className="min-w-full border divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 cursor-pointer" onClick={toggleSort}>
                Timestamp {sortAsc ? '▲' : '▼'}
              </th>
              <th className="px-4 py-2">User ID</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map((log) => (
              <tr key={log.id} className="odd:bg-gray-100">
                <td className="border px-4 py-2">{formatDate(log.created_at)}</td>
                <td className="border px-4 py-2">{log.user_id}</td>
                <td className="border px-4 py-2">{log.action}</td>
                <td className="border px-4 py-2">{log.metadata ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
