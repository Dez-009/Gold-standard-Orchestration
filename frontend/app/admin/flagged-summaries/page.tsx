'use client';

// Admin page listing summaries flagged for moderation

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getFlaggedSummaries } from '../../../services/apiClient';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface FlaggedSummaryRow {
  id: string;
  user_id: number;
  flag_reason: string | null;
  summary_text: string;
  created_at: string;
  flagged_at: string | null;
}

export default function FlaggedSummaryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<FlaggedSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const load = async () => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getFlaggedSummaries(token, {
        user_id: userId || undefined,
        date_from: fromDate || undefined,
        date_to: toDate || undefined
      });
      setRows(data);
    } catch {
      setError('Failed to load summaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  const applyFilters = () => {
    load();
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <div className="bg-yellow-100 text-red-800 px-4 py-2 rounded w-full text-center">
        Moderation View: Flagged Summaries
      </div>
      <div className="flex gap-2 items-end">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          className="border p-1 rounded"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-1 rounded"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-1 rounded"
        />
        <button onClick={applyFilters} className="px-3 py-1 border rounded">
          Apply
        </button>
      </div>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No flagged summaries.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Snippet</th>
                <th className="px-4 py-2">Flagged</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="odd:bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`/journal-summaries/${r.id}`)}
                >
                  <td className="border px-4 py-2 text-center">{r.user_id}</td>
                  <td className="border px-4 py-2">{r.flag_reason}</td>
                  <td className="border px-4 py-2 max-w-md truncate" title={r.summary_text}>
                    {r.summary_text}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {r.flagged_at ? fmt(r.flagged_at) : fmt(r.created_at)}
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

