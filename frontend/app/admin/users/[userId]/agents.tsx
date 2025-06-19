'use client';
/**
 * Admin page displaying agent usage metrics for a specific user.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getUserAgentUsageSummary } from '../../../../services/apiClient';
import { getToken, isTokenExpired, isAdmin } from '../../../../services/authUtils';
import { showError } from '../../../../components/ToastProvider';

interface AgentUsageRow {
  agent_name: string;
  runs: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  last_run: string;
}

export default function UserAgentUsagePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const [rows, setRows] = useState<AgentUsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load usage summary on mount with admin auth validation
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
        const data = await getUserAgentUsageSummary(userId, token);
        setRows(data);
      } catch {
        setError('Failed to load usage');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, userId]);

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  const exportCsv = () => {
    const header = 'Agent,Runs,Input Tokens,Output Tokens,Cost USD,Last Run\n';
    const lines = rows
      .map((r) =>
        [r.agent_name, r.runs, r.input_tokens, r.output_tokens, r.cost_usd, r.last_run].join(',')
      )
      .join('\n');
    const blob = new Blob([header + lines], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-${userId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">User Agent Usage</h1>
      <button
        onClick={exportCsv}
        className="border px-3 py-1 rounded bg-blue-600 text-white text-sm"
      >
        Export CSV
      </button>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No usage found.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Runs</th>
                <th className="px-4 py-2">Input</th>
                <th className="px-4 py-2">Output</th>
                <th className="px-4 py-2">Cost</th>
                <th className="px-4 py-2">Last Run</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.agent_name} className="odd:bg-gray-100 text-center">
                  <td className="border px-2 py-1">{r.agent_name}</td>
                  <td className="border px-2 py-1">{r.runs}</td>
                  <td className="border px-2 py-1">{r.input_tokens}</td>
                  <td className="border px-2 py-1">{r.output_tokens}</td>
                  <td className="border px-2 py-1">${r.cost_usd}</td>
                  <td className="border px-2 py-1">{fmt(r.last_run)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Footnote: Allows CSV export of per-agent usage for auditing purposes.
