'use client';
// Admin page showing recent agent timeout events

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAgentTimeouts, AgentTimeoutRecord } from '../../../services/agentTimeoutService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AgentTimeoutsPage() {
  const router = useRouter();
  // Notes: Local state for table rows and flags
  const [rows, setRows] = useState<AgentTimeoutRecord[]>([]);
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
        // Notes: Request timeout logs from the backend
        const data = await fetchAgentTimeouts();
        setRows(data);
      } catch {
        setError('Failed to load timeouts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Format timestamp for display
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Agent Timeouts</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No timeouts found.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{r.user_id}</td>
                  <td className="border px-4 py-2">{r.agent_name}</td>
                  <td className="border px-4 py-2">{fmt(r.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
