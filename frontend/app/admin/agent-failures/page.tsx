'use client';
// Admin page displaying queued agent failures

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchAgentFailures,
  triggerFailureQueueProcessing,
  AgentFailureRecord
} from '../../../services/agentFailureService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AgentFailuresPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AgentFailureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Load queue entries on mount
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
        const data = await fetchAgentFailures();
        setRows(data);
      } catch {
        setError('Failed to load failures');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await triggerFailureQueueProcessing();
      const data = await fetchAgentFailures();
      setRows(data);
    } catch {
      // Error toast handled in service
    } finally {
      setProcessing(false);
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Agent Failure Queue</h1>
      <button
        onClick={handleProcess}
        disabled={processing}
        className="px-3 py-1 border rounded"
      >
        {processing ? 'Processing...' : 'Process Queue'}
      </button>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No failures found.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Retries</th>
                <th className="px-4 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{r.user_id}</td>
                  <td className="border px-4 py-2">{r.agent_name}</td>
                  <td className="border px-4 py-2 truncate max-w-xs">{r.failure_reason}</td>
                  <td className="border px-4 py-2 text-center">
                    {r.retry_count} / {r.max_retries}
                  </td>
                  <td className="border px-4 py-2">{fmt(r.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
