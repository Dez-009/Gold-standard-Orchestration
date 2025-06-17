'use client';
// Page for administrators to override agent assignments

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAgentOverrides, assignAgentOverride } from '../../../services/adminService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

interface AssignmentRow {
  user_id: number;
  user_email: string;
  agent_type: string;
  assigned_at: string;
}

const agents = ['career', 'health', 'relationship'];

export default function AgentOverridePage() {
  const router = useRouter();
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Record<number, string>>({});

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
        const data = await fetchAgentOverrides();
        setRows(data.assignments as AssignmentRow[]);
        const mapping: Record<number, string> = {};
        (data.overrides as any[]).forEach((o) => {
          mapping[o.user_id] = o.agent_id;
        });
        setSelected(mapping);
      } catch {
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleSave = async (user_id: number) => {
    const agent_id = selected[user_id];
    if (!agent_id) return;
    try {
      await assignAgentOverride({ user_id, agent_id });
      showSuccess('Override saved');
    } catch {
      // Error toast shown in service
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Agent Overrides</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No assignments found.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User Email</th>
                <th className="px-4 py-2">Current Agent</th>
                <th className="px-4 py-2">Override</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{r.user_email}</td>
                  <td className="border px-4 py-2 capitalize">{r.agent_type}</td>
                  <td className="border px-4 py-2">
                    <select
                      value={selected[r.user_id] || ''}
                      onChange={(e) =>
                        setSelected({ ...selected, [r.user_id]: e.target.value })
                      }
                      className="border p-1 rounded"
                    >
                      <option value="">--</option>
                      {agents.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleSave(r.user_id)}
                      className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
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
