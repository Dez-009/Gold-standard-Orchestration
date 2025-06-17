'use client';
// Admin page that lists recent audit logs in a paginated table

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAuditLogs, AuditLogRecord } from '../../../services/auditService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AdminAuditLogsPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Notes: State storing the fetched logs
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  // Notes: Loading and error indicators
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Notes: Pagination state tracking offset and limit
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Notes: Load audit logs once user/session validation passes
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
        const data = await fetchAuditLogs(limit, offset);
        setLogs(data);
      } catch {
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, offset]);

  // Notes: Format timestamp strings for display
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  // Notes: Convert the details JSON for agent assignment logs into readable text
  const renderDetails = (log: AuditLogRecord) => {
    if (log.event_type === 'AGENT_ASSIGNMENT' && log.details) {
      try {
        const data = JSON.parse(log.details);
        return (
          <span>
            Assigned <b>{data.assigned_agent}</b> to user{' '}
            <b>{data.user_id}</b> for domain <b>{data.domain}</b>
          </span>
        );
      } catch {
        // Notes: Fallback to raw details if JSON parsing fails
        return log.details;
      }
    }
    return log.details ?? '';
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      {/* Loading indicator, error message or table */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>No logs found.</p>}

      {!loading && !error && logs.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Event</th>
                <th className="px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{fmt(log.timestamp)}</td>
                  <td className="border px-4 py-2">{log.user_id ?? 'N/A'}</td>
                  <td className="border px-4 py-2">{log.event_type}</td>
                  <td className="border px-4 py-2">{renderDetails(log)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination buttons for previous/next */}
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

