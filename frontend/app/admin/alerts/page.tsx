'use client';
/**
 * Admin table listing summaries flagged due to low ratings.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchFeedbackAlerts } from '../../../services/feedbackAlertService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface AlertRow {
  id: string;
  user_id: number;
  summary_id: string;
  rating: number;
  flagged_reason: string | null;
  created_at: string;
  summary_preview: string;
}

export default function FeedbackAlertPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load alert data on mount with auth validation
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
        const data = await fetchFeedbackAlerts();
        setAlerts(data);
      } catch {
        setError('Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Feedback Alerts</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && alerts.length === 0 && <p>No alerts found.</p>}
      {!loading && !error && alerts.length > 0 && (
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Rating</th>
              <th className="px-4 py-2">Preview</th>
              <th className="px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id} className="odd:bg-gray-100 text-center">
                <td className="border px-4 py-2">{a.user_id}</td>
                <td className="border px-4 py-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded" title={a.flagged_reason || ''}>
                    {a.rating} ⭐
                  </span>
                </td>
                <td className="border px-4 py-2">
                  <Link href={`/journal-summaries/${a.summary_id}`} className="underline">
                    {a.summary_preview}
                  </Link>
                </td>
                <td className="border px-4 py-2">{fmt(a.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Footnote: This page helps admins monitor problematic summaries.
