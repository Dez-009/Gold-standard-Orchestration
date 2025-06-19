'use client';
// Admin page showing self reported scores from agents

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchSelfScores, SelfScoreRecord } from '../../../services/agentScoreService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AgentSelfScorePage() {
  const router = useRouter();
  // Notes: table rows and loading state
  const [scores, setScores] = useState<SelfScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'agent_name' | 'created_at' | 'self_score'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Notes: load scores on mount with auth checks
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
      try {
        const data = await fetchSelfScores();
        setScores(data);
      } catch {
        showError('Failed to load scores');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: update sorting state and reorder rows
  const sortBy = (field: 'agent_name' | 'created_at' | 'self_score') => {
    const dir = field === sortField && sortDir === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDir(dir);
    setScores(prev => {
      return [...prev].sort((a, b) => {
        const aVal = (a as any)[field];
        const bVal = (b as any)[field];
        if (aVal < bVal) return dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    });
  };

  // Notes: compute averages per agent for quick reference
  const averages: Record<string, number> = {};
  scores.forEach((r) => {
    averages[r.agent_name] = ((averages[r.agent_name] || 0) + r.self_score);
  });
  Object.keys(averages).forEach((k) => {
    const count = scores.filter(r => r.agent_name === k).length;
    averages[k] = averages[k] / count;
  });

  // Notes: helper to format times for display
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Agent Self Scores</h1>
      {loading && (
        <div className="w-full space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-6 bg-gray-300 rounded" />
          ))}
        </div>
      )}
      {!loading && (
        <div className="w-full space-y-4">
          <div className="space-y-1">
            {Object.entries(averages).map(([name, val]) => (
              <div key={name}>{name}: {val.toFixed(2)}</div>
            ))}
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full border divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => sortBy('agent_name')}>Agent</th>
                  <th className="px-4 py-2">Summary</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => sortBy('self_score')}>Score</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => sortBy('created_at')}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {scores.map(row => (
                  <tr key={row.id} className="odd:bg-gray-100">
                    <td className="border px-4 py-2">{row.agent_name}</td>
                    <td className="border px-4 py-2">
                      <Link href={`/admin/journal-summaries/${row.summary_id}`} className="underline text-blue-600">
                        View
                      </Link>
                    </td>
                    <td className="border px-4 py-2 text-center">{row.self_score.toFixed(2)}</td>
                    <td className="border px-4 py-2">{fmt(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Footnote: Displays confidence ratings submitted by each agent.

