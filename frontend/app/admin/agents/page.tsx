'use client';
// Admin page listing all agent assignments with filtering

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAgentAssignments } from '../../../services/agentService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

// Shape of the assignment objects returned by the backend
interface Assignment {
  user_email: string;
  agent_type: string;
  assigned_at: string;
}

export default function AgentAssignmentsPage() {
  const router = useRouter(); // Router for redirects on auth failure
  // Local state for assignments, loading flag, error message and filter
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  // Validate admin token and load assignments on mount
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
        // Request assignment data from the service layer
        const data = await fetchAgentAssignments();
        setAssignments(data);
      } catch {
        // Display friendly error on failure
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Sort newest first and apply simple type filter
  const sorted = assignments.sort(
    (a, b) => new Date(b.assigned_at).valueOf() - new Date(a.assigned_at).valueOf()
  );
  const filtered = sorted.filter((a) => (filter === 'ALL' ? true : a.agent_type === filter));

  // Helper to format the date into locale string
  const fmt = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading and stub filter dropdown */}
      <h1 className="text-2xl font-bold">Agent Assignments</h1>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="ALL">All</option>
        <option value="career">Career</option>
        <option value="health">Health</option>
        <option value="relationship">Relationship</option>
      </select>
      {/* Loading spinner and error message */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>No assignments found.</p>}
      {/* Table of assignments */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User Email</th>
                <th className="px-4 py-2">Agent Type</th>
                <th className="px-4 py-2">Assigned At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => (
                <tr key={idx} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{a.user_email}</td>
                  <td className="border px-4 py-2 capitalize">{a.agent_type}</td>
                  <td className="border px-4 py-2">{fmt(a.assigned_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
