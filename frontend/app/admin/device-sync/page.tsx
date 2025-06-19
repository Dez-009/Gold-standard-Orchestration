'use client';
/**
 * Admin page showing device synchronization history.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchLogs, DeviceSyncRecord } from '../../../services/deviceSyncService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function DeviceSyncLogPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<DeviceSyncRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Notes: Load table data whenever offset changes
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
        const data = await fetchLogs(limit, offset);
        setLogs(data);
      } catch {
        setError('Failed to load sync logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, offset]);

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  // Notes: Determine whether the entry represents low activity or sleep debt
  const flags = (log: DeviceSyncRecord) => {
    const data: any = log.raw_data_preview || {};
    const lowMove = data.steps && data.steps < 5000;
    const lowSleep = data.sleep_hours && data.sleep_hours < 6;
    return { lowMove, lowSleep };
  };

  // Notes: Apply client side filtering based on selected options
  const filtered = logs.filter((log) => {
    const { lowMove } = flags(log);
    if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
    if (activityFilter === 'low' && !lowMove) return false;
    if (activityFilter === 'high' && lowMove) return false;
    return true;
  });

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Device Sync Logs</h1>
      {/* Filter controls */}
      <div className="flex space-x-4">
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All Sources</option>
          <option value="Fitbit">Fitbit</option>
          <option value="AppleHealth">AppleHealth</option>
        </select>
        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All Activity</option>
          <option value="low">Low Movement</option>
          <option value="high">Normal</option>
        </select>
      </div>
      {/* Loading and error states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>No sync logs found.</p>}
      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Synced At</th>
                <th className="px-4 py-2">Low Move</th>
                <th className="px-4 py-2">Sleep Deprived</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{log.user_id}</td>
                  <td className="border px-4 py-2">{log.source}</td>
                  <td className="border px-4 py-2 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        log.sync_status === 'success'
                          ? 'bg-green-500'
                          : log.sync_status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }`}
                    >
                      {log.sync_status}
                    </span>
                  </td>
                  <td className="border px-4 py-2">{fmt(log.synced_at)}</td>
                  <td className="border px-4 py-2 text-center">{flags(log).lowMove ? 'Yes' : '-'}</td>
                  <td className="border px-4 py-2 text-center">{flags(log).lowSleep ? 'Yes' : '-'}</td>
                  <td className="border px-4 py-2 text-sm">
                    {JSON.stringify(log.raw_data_preview).slice(0, 30)}
                  </td>
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

// Footnote: Admin UI page offering insight into wearable integrations.
