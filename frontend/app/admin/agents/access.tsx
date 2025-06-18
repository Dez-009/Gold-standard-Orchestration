'use client';
// Admin UI to toggle agent availability per subscription tier

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchAccessConfig,
  saveAccessTier,
  AccessConfig
} from '../../../services/agentAccessService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

const TIERS = ['free', 'plus', 'pro', 'admin'];

export default function AgentAccessMatrixPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<AccessConfig[]>([]);
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
        const data = await fetchAccessConfig();
        setConfigs(data);
      } catch {
        setError('Failed to load access policies');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const grouped = configs.reduce<Record<string, string>>((acc, c) => {
    acc[c.agent_name] = c.access_tier;
    return acc;
  }, {});

  const handleUpdate = async (agent: string, tier: string) => {
    try {
      await saveAccessTier(agent, tier);
      setConfigs((prev) =>
        prev.map((p) =>
          p.agent_name === agent ? { ...p, access_tier: tier } : p
        )
      );
      showSuccess('Policy updated');
    } catch {
      /* handled in service */
    }
  };

  const agents = Object.keys(grouped);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Agent Access</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && agents.length > 0 && (
        <table className="text-sm border divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2">Agent</th>
              <th className="px-4 py-2">Required Tier</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a} className="odd:bg-gray-100 text-center">
                <td className="border px-2 py-1">{a}</td>
                <td className="border px-2 py-1">
                  <select
                    value={grouped[a]}
                    onChange={(e) => handleUpdate(a, e.target.value)}
                    className="border p-1 rounded"
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && !error && agents.length === 0 && <p>No policies configured.</p>}
    </div>
  );
}

