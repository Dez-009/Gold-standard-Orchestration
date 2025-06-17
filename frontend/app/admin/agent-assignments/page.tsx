'use client';
// Admin page allowing manual agent assignments to users

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchAgentAssignments,
  assignAgent
} from '../../../services/adminAgentAssignmentService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface AssignmentRow {
  user_id: number;
  user_email: string;
  domain: string;
  assigned_agent: string;
  assigned_at: string;
}

export default function AdminAgentAssignmentsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ user_id: '', domain: '', agent: '' });

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
        const data = await fetchAgentAssignments();
        setRows(data);
      } catch {
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user_id, domain, agent } = form;
    if (!user_id || !domain || !agent) return;
    try {
      const result = await assignAgent(Number(user_id), domain, agent);
      setRows([...rows, result]);
      setForm({ user_id: '', domain: '', agent: '' });
    } catch {
      // Error toast displayed in service
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Agent Assignments</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="w-full space-y-4">
          <form onSubmit={handleSubmit} className="space-x-2">
            <input
              type="number"
              placeholder="User ID"
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className="border p-1 rounded"
            />
            <input
              type="text"
              placeholder="Domain"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              className="border p-1 rounded"
            />
            <input
              type="text"
              placeholder="Agent"
              value={form.agent}
              onChange={(e) => setForm({ ...form, agent: e.target.value })}
              className="border p-1 rounded"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
            >
              Assign
            </button>
          </form>
          {rows.length === 0 ? (
            <p>No assignments found.</p>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full border divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2">User Email</th>
                    <th className="px-4 py-2">Domain</th>
                    <th className="px-4 py-2">Agent</th>
                    <th className="px-4 py-2">Assigned At</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.user_id + r.domain} className="odd:bg-gray-100">
                      <td className="border px-4 py-2">{r.user_email}</td>
                      <td className="border px-4 py-2 capitalize">{r.domain}</td>
                      <td className="border px-4 py-2">{r.assigned_agent}</td>
                      <td className="border px-4 py-2">{fmt(r.assigned_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
