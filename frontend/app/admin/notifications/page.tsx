'use client';
// Admin page displaying notifications and allowing retries

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchNotifications,
  retryFailedNotification,
  NotificationRecord
} from '../../../services/notificationService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function NotificationsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verify admin permissions then load notifications
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
        const data = await fetchNotifications();
        setRecords(data);
      } catch {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleRetry = async (id: number) => {
    try {
      await retryFailedNotification(String(id));
      // Refresh the list after retrying
      const data = await fetchNotifications();
      setRecords(data);
    } catch {
      // Error toast handled in service
    }
  };

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : 'N/A';

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Notifications</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && records.length === 0 && <p>No notifications found.</p>}
      {!loading && !error && records.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((n) => (
                <tr key={n.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{n.user_id}</td>
                  <td className="border px-4 py-2 capitalize">{n.type}</td>
                  <td className="border px-4 py-2 capitalize">{n.status}</td>
                  <td className="border px-4 py-2">{fmt(n.created_at)}</td>
                  <td className="border px-4 py-2">
                    {n.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(n.id)}
                        className="bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700"
                      >
                        Retry
                      </button>
                    )}
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
