'use client';
// Admin page displaying recent audit logs in a sortable table

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Notes: Use the dedicated audit log service
import { fetchAuditLogs, fetchAuditStats, AuditLog, AuditLogFilters } from '../../../services/auditLogService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AuditLogsPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Notes: Hold the list of logs returned from the backend
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  // Notes: Track loading, error and sort state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  // Notes: Filter fields for action type and date range
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
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
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: AuditLogFilters = {
        limit: 1000, // Get more data for better filtering
        offset: 0
      };
      
      const [logsData, statsData] = await Promise.all([
        fetchAuditLogs(filters),
        fetchAuditStats()
      ]);
      
      setLogs(logsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load audit logs');
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Notes: Toggle the timestamp sort order between ascending and descending
  const toggleSort = () => setSortAsc((prev) => !prev);

  // Notes: Filter logs by selected criteria
  const filteredLogs = logs.filter((log) => {
    const ts = new Date(log.timestamp).getTime();
    const after = startDate ? new Date(startDate).getTime() : -Infinity;
    const before = endDate ? new Date(endDate).getTime() : Infinity;
    const actionOk = actionFilter ? log.event_type.toLowerCase().includes(actionFilter.toLowerCase()) : true;
    const userOk = userIdFilter ? (log.user_id?.toString() === userIdFilter) : true;
    return actionOk && userOk && ts >= after && ts <= before;
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
  const actionOptions = Array.from(new Set(logs.map((l) => l.event_type))).sort();

  const handleRefresh = async () => {
    console.log('Refresh button clicked');
    setPage(1);
    setError(''); // Clear any previous errors
    await loadData();
    console.log('Refresh completed');
  };

  const generateSampleData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch('http://localhost:8000/admin/audit/generate-sample', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        showError('Sample data generated!');
        await loadData();
      } else {
        const errorData = await response.json();
        setError(`Failed to generate sample data: ${errorData.detail || errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError('Failed to generate sample data');
      console.error('Error generating sample data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to the dashboard */}
      <Link href="/admin" className="self-start text-blue-600 underline">
        Back to Admin Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Total Logs</h3>
            <p className="text-2xl font-bold text-blue-900">{stats.total_logs}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Last 24 Hours</h3>
            <p className="text-2xl font-bold text-green-900">{stats.recent_logs_24h}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Action Types</h3>
            <p className="text-2xl font-bold text-purple-900">{stats.action_breakdown?.length || 0}</p>
          </div>
        </div>
      )}

      {/* Filter controls */}
      <div className="flex flex-wrap gap-2 w-full max-w-4xl">
        <input
          placeholder="User ID"
          value={userIdFilter}
          onChange={(e) => {
            setUserIdFilter(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        />
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
          placeholder="Start Date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
          placeholder="End Date"
        />
        <button
          onClick={handleRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
        <button
          onClick={generateSampleData}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Generate Sample Data
        </button>
      </div>

      {/* Show spinner, error message or empty state accordingly */}
      {loading && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          <span>Loading audit logs...</span>
        </div>
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>No audit logs found.</p>}

      {/* Results summary */}
      {!loading && !error && logs.length > 0 && (
        <div className="w-full max-w-4xl text-sm text-gray-600">
          Showing {paginatedLogs.length} of {filteredLogs.length} logs 
          {filteredLogs.length !== logs.length && ` (filtered from ${logs.length} total)`}
        </div>
      )}

      {/* Notes: Render the table when logs are available */}
      {!loading && !error && logs.length > 0 && (
        <div className="overflow-y-auto max-h-[70vh] w-full max-w-4xl">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={toggleSort}>
                  Timestamp {sortAsc ? '▲' : '▼'}
                </th>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="odd:bg-gray-50 hover:bg-gray-100">
                  <td className="border px-4 py-2 text-sm">{formatDate(log.timestamp)}</td>
                  <td className="border px-4 py-2 text-sm font-mono">
                    {log.user_id || 'System'}
                  </td>
                  <td className="border px-4 py-2 text-sm font-medium">{log.event_type}</td>
                  <td className="border px-4 py-2 text-sm max-w-xs truncate" title={log.details || ''}>
                    {log.details || '-'}
                  </td>
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
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            Prev
          </button>
          <span>
            Page {page} of {Math.ceil(sortedLogs.length / pageSize)}
          </span>
          <button
            onClick={() =>
              setPage((p) =>
                Math.min(Math.ceil(sortedLogs.length / pageSize), p + 1)
              )
            }
            disabled={page >= Math.ceil(sortedLogs.length / pageSize)}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
