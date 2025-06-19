'use client';
// Admin page displaying recent audit logs in a sortable table

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Notes: Use the dedicated audit log service
import { fetchAuditLogs } from '../../../services/auditLogService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

// Define the expected shape of an audit log record
interface AuditLog {
  id: number;
  timestamp: string;
  user_email: string | null;
  action: string;
  detail: string | null;
  ip_address?: string | null;
}

export default function AuditLogsPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Notes: Hold the list of logs returned from the backend
  const [logs, setLogs] = useState<AuditLog[]>([]);
  // Notes: Track loading, error and sort state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  // Notes: Filter fields for action type and date range
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Notes: Pagination state tracking current page index
  const [page, setPage] = useState(1);
  const pageSize = 20; // Notes: Fixed number of rows per page

  // Notes: Verify session then fetch audit logs once when the page mounts
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
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
  }, [router]);

  // Notes: Toggle the timestamp sort order between ascending and descending
  const toggleSort = () => setSortAsc((prev) => !prev);

  // Notes: Filter logs by selected action and date range
  const filteredLogs = logs.filter((log) => {
    const ts = new Date(log.timestamp).getTime();
    const after = startDate ? new Date(startDate).getTime() : -Infinity;
    const before = endDate ? new Date(endDate).getTime() : Infinity;
    const actionOk = actionFilter ? log.action === actionFilter : true;
    return actionOk && ts >= after && ts <= before;
  });

  // Notes: Sort the filtered logs based on timestamp order
  const sortedLogs = [...filteredLogs].sort((a, b) =>
    sortAsc
      ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Notes: Paginate the sorted logs according to current page
  const paginatedLogs = sortedLogs.slice((page - 1) * pageSize, page * pageSize);

  // Notes: Format ISO timestamps into a readable date string
  const formatDate = (iso: string) => new Date(iso).toLocaleString();
  // Notes: Derive list of actions for the filter dropdown
  const actionOptions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      {/* Filter controls */}
      <div className="flex flex-wrap gap-2 w-full max-w-xl">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value="">All Actions</option>
          {actionOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        />
      </div>

      {/* Show spinner, error message or empty state accordingly */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>No audit logs found.</p>}

      {/* Notes: Render the table when logs are available */}
      {!loading && !error && logs.length > 0 && (
        <div className="overflow-y-auto max-h-[70vh] w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 cursor-pointer" onClick={toggleSort}>
                  Timestamp {sortAsc ? '▲' : '▼'}
                </th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Detail</th>
                <th className="px-4 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{formatDate(log.timestamp)}</td>
                  <td className="border px-4 py-2">{log.user_email ?? 'system'}</td>
                  <td className="border px-4 py-2">{log.action}</td>
                  <td className="border px-4 py-2">{log.detail ?? ''}</td>
                  <td className="border px-4 py-2">{log.ip_address ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination controls */}
      {!loading && !error && sortedLogs.length > pageSize && (
        <div className="flex items-center space-x-4 mt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} / {Math.ceil(sortedLogs.length / pageSize)}
          </span>
          <button
            onClick={() =>
              setPage((p) =>
                Math.min(Math.ceil(sortedLogs.length / pageSize), p + 1)
              )
            }
            disabled={page >= Math.ceil(sortedLogs.length / pageSize)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
