'use client';
// Admin page listing journal entries with source tagging and filter

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAdminJournals, AdminJournalRecord } from '../../../services/adminJournalService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AdminJournalsPage() {
  const router = useRouter();
  // Data table rows and UI state
  const [journals, setJournals] = useState<AdminJournalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiOnly, setAiOnly] = useState(false);

  // Validate admin session and load journals
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
        const data = await fetchAdminJournals({ ai_only: aiOnly });
        setJournals(data);
      } catch {
        setError('Failed to load journals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, aiOnly]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading and filter toggle */}
      <h1 className="text-2xl font-bold">Journal Entries</h1>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={aiOnly}
          onChange={(e) => setAiOnly(e.target.checked)}
        />
        <span>Show only AI-generated</span>
      </label>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && journals.length === 0 && <p>No journals found.</p>}
      {!loading && !error && journals.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {journals.map((row) => (
                <tr key={row.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{row.user_id}</td>
                  <td className="border px-4 py-2">{row.title ?? 'Untitled'}</td>
                  <td className="border px-4 py-2">{formatDate(row.created_at)}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${row.ai_generated ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {row.ai_generated ? 'AI' : 'User'}
                    </span>
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

