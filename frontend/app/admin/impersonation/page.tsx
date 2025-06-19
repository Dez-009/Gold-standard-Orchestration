'use client';
// Admin page allowing administrators to impersonate users for troubleshooting

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchUsers, impersonateUser, ImpersonationUser } from '../../../services/impersonationService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

export default function ImpersonationPage() {
  const router = useRouter();
  // Local state for list of users and UI status flags
  const [users, setUsers] = useState<ImpersonationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  // Verify admin session and load user list on mount
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const loadUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [router]);

  // Debounce the search input so filtering isn't too aggressive
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  // Filter users by email or id once the debounce value updates
  const filtered = users.filter((u) => {
    const term = debounced.toLowerCase();
    return (
      u.email.toLowerCase().includes(term) ||
      u.id.toString() === term
    );
  });

  // Handle click on the impersonate button for a given user
  const handleImpersonate = async (id: number) => {
    setLoading(true);
    try {
      await impersonateUser(id);
      showSuccess('Now impersonating user');
      router.push('/dashboard');
    } catch {
      showError('Failed to impersonate user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading and search input */}
      <h1 className="text-2xl font-bold">User Impersonation</h1>
      <input
        type="text"
        placeholder="Search by email or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full max-w-md"
      />

      {/* Loading, error and empty states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>No users found.</p>}

      {/* Table of users with impersonate button */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{user.id}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleImpersonate(user.id)}
                      className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Impersonate
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
