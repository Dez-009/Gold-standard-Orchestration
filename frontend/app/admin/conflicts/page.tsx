'use client';
// Admin dashboard page listing unresolved conflict flags

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { getUserConflictFlags, ConflictFlag, resolveFlag } from '../../../services/conflictResolutionService';
import { showError } from '../../../components/ToastProvider';

export default function AdminConflictsPage() {
  const router = useRouter();
  const [flags, setFlags] = useState<ConflictFlag[]>([]);
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
    const uid = (() => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return String(payload.user_id);
      } catch {
        return null;
      }
    })();
    if (!uid) return;
    getUserConflictFlags(uid)
      .then((data) => setFlags(data.filter((f) => !f.resolved)))
      .catch(() => setError('Failed to load flags'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleResolve = async (id: string) => {
    try {
      await resolveFlag(id);
      setFlags((prev) => prev.filter((f) => f.id !== id));
    } catch {
      showError('Failed to resolve');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Conflict Flags</h1>
      {loading && <div>Loading...</div>}
      {error && <p className="text-red-600">{error}</p>}
      <table className="table-auto border collapse">
        <thead>
          <tr>
            <th className="border px-2">User</th>
            <th className="border px-2">Excerpt</th>
            <th className="border px-2">Type</th>
            <th className="border px-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((f) => (
            <tr key={f.id} className="border-b text-sm">
              <td className="border px-2">{f.user_id}</td>
              <td className="border px-2 italic">{f.summary_excerpt}</td>
              <td className="border px-2">{f.conflict_type}</td>
              <td className="border px-2">
                <button
                  onClick={() => handleResolve(f.id)}
                  className="text-blue-600 underline text-xs"
                >
                  Resolve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
