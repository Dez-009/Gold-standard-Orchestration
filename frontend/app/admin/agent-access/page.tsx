'use client';
// Admin page displaying which roles can access each agent

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAgentAccessRules } from '../../../services/agentAccessService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface AccessRule {
  agent: string;
  role: string;
}

export default function AgentAccessPage() {
  const router = useRouter();
  // Local state containing rules and status flags
  const [rules, setRules] = useState<AccessRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verify admin token and load rules on mount
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
        const data = await fetchAgentAccessRules();
        setRules(data);
      } catch {
        setError('Failed to load access rules');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Agent Access Rules</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rules.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Agent Name</th>
                <th className="px-4 py-2">Required Role</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, idx) => (
                <tr key={idx} className="odd:bg-gray-100">
                  <td className="border px-4 py-2 capitalize">{r.agent}</td>
                  <td className="border px-4 py-2 capitalize">{r.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && rules.length === 0 && <p>No rules configured.</p>}
    </div>
  );
}

// Footnote: Provides a read-only view of agent role requirements for admins.
