'use client';
// Admin UI to toggle agent availability per subscription tier

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchAccessPolicies,
  saveAccessPolicy,
  AccessPolicy
} from '../../../services/agentAccessService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

const TIERS = ['free', 'basic', 'premium'];

export default function AgentAccessMatrixPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<AccessPolicy[]>([]);
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
        const data = await fetchAccessPolicies();
        setPolicies(data);
      } catch {
        setError('Failed to load access policies');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const grouped = policies.reduce<Record<string, Record<string, boolean>>>(
    (acc, p) => {
      if (!acc[p.agent_name]) acc[p.agent_name] = {} as Record<string, boolean>;
      acc[p.agent_name][p.subscription_tier] = p.is_enabled;
      return acc;
    },
    {}
  );

  const handleToggle = async (
    agent: string,
    tier: string,
    value: boolean
  ) => {
    try {
      await saveAccessPolicy(agent, tier, value);
      setPolicies((prev) =>
        prev.map((p) =>
          p.agent_name === agent && p.subscription_tier === tier
            ? { ...p, is_enabled: value }
            : p
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
              {TIERS.map((t) => (
                <th key={t} className="px-4 py-2 capitalize">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a} className="odd:bg-gray-100 text-center">
                <td className="border px-2 py-1">{a}</td>
                {TIERS.map((t) => (
                  <td key={t} className="border px-2 py-1">
                    <input
                      type="checkbox"
                      checked={grouped[a]?.[t] || false}
                      onChange={(e) => handleToggle(a, t, e.target.checked)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && !error && agents.length === 0 && <p>No policies configured.</p>}
    </div>
  );
}

