'use client';
// Admin user management page listing all registered users
// Fetches user data on mount and displays it in a table with a search bar

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAllUsers } from '../../../services/userManagementService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

// Shape of the user object returned by the backend
interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

export default function UserManagementPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Notes: Local state for the list of users and page status flags
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Notes: Verify admin session and load all users once on mount
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
        // Notes: Request the full user list using the service wrapper
        const data = await fetchAllUsers();
        setUsers(data);
      } catch {
        // Notes: Display a generic error message when the request fails
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [router]);

  // Notes: Simple case-insensitive filter across common user fields
  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(term) ||
      u.first_name.toLowerCase().includes(term) ||
      u.last_name.toLowerCase().includes(term)
    );
  });

  // Notes: Helper to format dates as locale strings
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard for convenience */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading and optional filter input */}
      <h1 className="text-2xl font-bold">User Management</h1>
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full max-w-md"
      />

      {/* Conditional rendering of loading, error and empty states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>No users found.</p>}

      {/* Render the responsive table when data is available */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">First Name</th>
                <th className="px-4 py-2">Last Name</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{user.id}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.first_name}</td>
                  <td className="border px-4 py-2">{user.last_name}</td>
                  <td className="border px-4 py-2 capitalize">{user.role}</td>
                  <td className="border px-4 py-2">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

