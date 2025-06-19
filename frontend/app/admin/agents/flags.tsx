'use client';
// Admin page listing flagged agent outputs

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchAgentFlags,
  markAgentFlagReviewed,
  AgentFlagRecord
} from '../../../services/agentFlagService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

export default function AgentFlagPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AgentFlagRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const data = await fetchAgentFlags();
        setRows(data);
      } catch {
        setError('Failed to load flags');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  const handleReview = async (id: string) => {
    try {
      await markAgentFlagReviewed(id);
      setRows((prev) => prev.map((f) => (f.id === id ? { ...f, reviewed: true } : f)));
      showSuccess('Flag marked reviewed');
    } catch {
      /* error toast shown in service */
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Flagged Agent Output</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No flags found.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{f.agent_name}</td>
                  <td className="border px-4 py-2">{f.user_id}</td>
                  <td className="border px-4 py-2 truncate max-w-xs">{f.reason}</td>
                  <td className="border px-4 py-2">{fmt(f.created_at)}</td>
                  <td className="border px-4 py-2 text-center">
                    {f.reviewed ? (
                      'Yes'
                    ) : (
                      <button
                        onClick={() => handleReview(f.id)}
                        className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                      >
                        Mark Reviewed
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
