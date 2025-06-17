'use client';
// Admin page listing user feedback with filtering and pagination

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAdminFeedback } from '../../../services/feedbackService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

const types = ['All', 'Bug', 'Feature Request', 'Praise', 'Complaint', 'Other'];

interface FeedbackRecord {
  id: string;
  user_id: number | null;
  feedback_type: string;
  message: string;
  submitted_at: string;
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [type, setType] = useState('All');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = { limit: 20, offset: page * 20 };
      if (type !== 'All') params.feedback_type = type;
      const data = await fetchAdminFeedback(params);
      setRecords(data as FeedbackRecord[]);
    } catch {
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, type, page]);

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">User Feedback</h1>
      <div className="w-full max-w-md space-y-2">
        <select
          value={type}
          onChange={(e) => {
            setPage(0);
            setType(e.target.value);
          }}
          className="border rounded w-full p-2"
        >
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{r.id.slice(0, 8)}</td>
                  <td className="border px-4 py-2">{r.user_id ?? 'Anon'}</td>
                  <td className="border px-4 py-2">{r.feedback_type}</td>
                  <td className="border px-4 py-2 max-w-xs truncate">{r.message}</td>
                  <td className="border px-4 py-2">{fmt(r.submitted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
