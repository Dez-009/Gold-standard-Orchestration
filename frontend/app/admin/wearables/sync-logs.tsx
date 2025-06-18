'use client';
/**
 * Admin page listing wearable synchronization events for auditing.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWearableSyncLogs, WearableSyncRecord } from '../../../services/wearableService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function WearableSyncLogsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<WearableSyncRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Notes: Load logs whenever pagination offset changes
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
        const data = await fetchWearableSyncLogs(limit, offset);
        setRows(data);
      } catch {
        setError('Failed to load sync logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, offset]);

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  const statusColor = (status: string) =>
    status === 'success'
      ? 'bg-green-500'
      : status === 'partial'
      ? 'bg-yellow-500'
      : 'bg-red-500';

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Title */}
      <h1 className="text-2xl font-bold">Wearable Sync Logs</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No sync logs found.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Device</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Synced At</th>
                <th className="px-4 py-2">Raw Data</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{r.user_id}</td>
                  <td className="border px-4 py-2 capitalize">{r.device_type}</td>
                  <td className="border px-4 py-2">
                    <span className={`px-2 py-1 rounded text-white ${statusColor(r.sync_status)}`}>{r.sync_status}</span>
                  </td>
                  <td className="border px-4 py-2">{fmt(r.synced_at)}</td>
                  <td className="border px-4 py-2 text-blue-600 underline">
                    {r.raw_data_url ? (
                      <a href={r.raw_data_url} target="_blank" rel="noreferrer">
                        View
                      </a>
                    ) : (
                      '-'
                    )}
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

// Footnote: Admin interface for verifying wearable integrations.
