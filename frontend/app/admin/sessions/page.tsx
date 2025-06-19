'use client';
// Admin page displaying recent user login sessions

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchUserSessions, UserSessionRecord } from '../../../services/userSessionService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AdminSessionsPage() {
  const router = useRouter();
  // Notes: Hold fetched session records
  const [sessions, setSessions] = useState<UserSessionRecord[]>([]);
  // Notes: Track loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notes: Validate auth and load sessions on mount
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
        const data = await fetchUserSessions();
        setSessions(data);
      } catch {
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Format ISO timestamps for readability
  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString() : 'Active';

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading */}
      <h1 className="text-2xl font-bold">User Sessions</h1>

      {/* Conditional content based on state */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && sessions.length === 0 && <p>No sessions found.</p>}

      {!loading && !error && sessions.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Session Start</th>
                <th className="px-4 py-2">Session End</th>
                <th className="px-4 py-2">Duration (s)</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, idx) => (
                <tr key={idx} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{s.user_id}</td>
                  <td className="border px-4 py-2">{fmt(s.session_start)}</td>
                  <td className="border px-4 py-2">{fmt(s.session_end)}</td>
                  <td className="border px-4 py-2">{s.total_duration ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
