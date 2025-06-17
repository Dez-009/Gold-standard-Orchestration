'use client';
// Admin page displaying current agent states and allowing updates

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAgentStates, modifyAgentState, AgentStateRecord } from '../../../services/agentStateService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

export default function AgentStatePage() {
  const router = useRouter();
  const [states, setStates] = useState<AgentStateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Record<string, string>>({});

  // Load data on mount
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
        const data = await fetchAgentStates();
        setStates(data);
      } catch {
        setError('Failed to load agent states');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Handle dropdown change for an individual row
  const handleChange = (id: string, value: string) => {
    setEditing((prev) => ({ ...prev, [id]: value }));
  };

  // Save new state for a row
  const handleSave = async (id: string) => {
    try {
      const updated = await modifyAgentState(id, editing[id]);
      setStates((prev) =>
        prev.map((s) => (s.id === id ? { ...s, state: updated.state, updated_at: updated.updated_at } : s))
      );
      showSuccess('State updated');
    } catch {
      showError('Failed to update state');
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  const options = ['idle', 'active', 'waiting', 'error', 'paused'];

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Agent States</h1>
      {/* Loading and error */}
      {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && states.length === 0 && <p>No agent states found.</p>}
      {/* Table */}
      {!loading && !error && states.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">State</th>
                <th className="px-4 py-2">Updated</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {states.map((s) => (
                <tr key={s.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{s.user_id}</td>
                  <td className="border px-4 py-2">{s.agent_name}</td>
                  <td className="border px-4 py-2 capitalize">{s.state}</td>
                  <td className="border px-4 py-2">{fmt(s.updated_at)}</td>
                  <td className="border px-4 py-2">
                    <select
                      value={editing[s.id] ?? s.state}
                      onChange={(e) => handleChange(s.id, e.target.value)}
                      className="border p-1 rounded mr-2 capitalize"
                    >
                      {options.map((opt) => (
                        <option key={opt} value={opt} className="capitalize">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSave(s.id)}
                      className="px-3 py-1 border rounded"
                      disabled={!editing[s.id] || editing[s.id] === s.state}
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
