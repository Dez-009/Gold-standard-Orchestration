'use client';
// Admin page listing agent scoring results with filters and pagination

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAgentScores, AgentScoreRecord } from '../../../services/agentScoringService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AgentScoresPage() {
  const router = useRouter();
  // Table data and UI states
  const [scores, setScores] = useState<AgentScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Filter inputs
  const [agentName, setAgentName] = useState('');
  const [userId, setUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Load scores whenever filters or pagination change
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
        const data = await fetchAgentScores({
          agent_name: agentName || undefined,
          user_id: userId ? Number(userId) : undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          limit,
          offset
        });
        setScores(data);
      } catch {
        setError('Failed to load scores');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, agentName, userId, startDate, endDate, offset]);

  // Helper to format timestamps
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Agent Scoring Results</h1>
      {/* Filter controls */}
      <div className="flex flex-wrap gap-2">
        <input
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Agent"
          className="border p-1 rounded"
        />
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          className="border p-1 rounded w-24"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-1 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-1 rounded"
        />
        <button onClick={() => setOffset(0)} className="px-3 py-1 border rounded">
          Apply
        </button>
      </div>
      {/* Loading and error states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && scores.length === 0 && <p>No scores found.</p>}
      {/* Data table */}
      {!loading && !error && scores.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Completeness</th>
                <th className="px-4 py-2">Clarity</th>
                <th className="px-4 py-2">Relevance</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((row) => (
                <tr key={row.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{fmt(row.created_at)}</td>
                  <td className="border px-4 py-2">{row.user_id}</td>
                  <td className="border px-4 py-2">{row.agent_name}</td>
                  <td className="border px-4 py-2 text-center">{row.completeness_score.toFixed(2)}</td>
                  <td className="border px-4 py-2 text-center">{row.clarity_score.toFixed(2)}</td>
                  <td className="border px-4 py-2 text-center">{row.relevance_score.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination controls */}
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

// Footnote: Admin interface for evaluating agent scoring metrics.
