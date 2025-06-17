'use client';
// Admin page listing summarized journals with simple search and pagination

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchSummarizedJournals, SummarizedJournalRecord } from '../../../services/adminJournalSummaryService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function JournalSummariesPage() {
  const router = useRouter();
  // Table data and pagination state
  const [summaries, setSummaries] = useState<SummarizedJournalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Load summaries whenever filter or pagination changes
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
        const data = await fetchSummarizedJournals(
          userId ? Number(userId) : undefined
        );
        setSummaries(data.slice(offset, offset + limit));
      } catch {
        setError('Failed to load summaries');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, userId, offset]);

  // Helper to format timestamp strings
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading and filter */}
      <h1 className="text-2xl font-bold">Summarized Journals</h1>
      <div className="flex gap-2">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Filter by User ID"
          className="border p-1 rounded w-40"
        />
        <button onClick={() => setOffset(0)} className="px-3 py-1 border rounded">
          Apply
        </button>
      </div>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && summaries.length === 0 && <p>No summaries found.</p>}
      {!loading && !error && summaries.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Summary</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((row) => (
                <tr key={row.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{row.user_id}</td>
                  <td className="border px-4 py-2 max-w-md truncate" title={row.summary_text}>
                    {row.summary_text}
                  </td>
                  <td className="border px-4 py-2">{fmt(row.created_at)}</td>
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

// Footnote: Lists AI-generated journal summaries for admin review.
