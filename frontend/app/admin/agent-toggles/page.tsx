'use client';
/**
 * Admin panel listing all agents with an on/off switch.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import {
  getAgentToggles,
  updateAgentToggle,
} from '../../../services/apiClient';
import { showError, showSuccess } from '../../../components/ToastProvider';

interface AgentToggleRow {
  agent_name: string;
  enabled: boolean;
  updated_at: string;
}

export default function AgentTogglePage() {
  const router = useRouter();
  const [toggles, setToggles] = useState<AgentToggleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load toggle list on mount
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
        const data = await getAgentToggles(token);
        setToggles(data);
      } catch {
        setError('Failed to load toggles');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Handle checkbox change
  const handleToggle = async (name: string, enabled: boolean) => {
    const token = getToken();
    if (!token) {
      showError('Something went wrong');
      return;
    }
    try {
      const updated = await updateAgentToggle(token, {
        agent_name: name,
        enabled,
      });
      setToggles((prev) =>
        prev.map((t) => (t.agent_name === name ? updated : t))
      );
      showSuccess('Toggle updated');
    } catch {
      showError('Failed to update');
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Agent Toggles</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && toggles.length === 0 && <p>No agents found.</p>}
      {!loading && !error && toggles.length > 0 && (
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2">Agent</th>
              <th className="px-4 py-2">Enabled</th>
              <th className="px-4 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {toggles.map((t) => (
              <tr key={t.agent_name} className="odd:bg-gray-100 text-center">
                <td className="border px-4 py-2">{t.agent_name}</td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={t.enabled}
                    onChange={(e) => handleToggle(t.agent_name, e.target.checked)}
                  />
                </td>
                <td className="border px-4 py-2">{fmt(t.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Footnote: Admin panel for flipping agents on or off.
