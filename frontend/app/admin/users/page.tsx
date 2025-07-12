'use client';
// Admin page for managing users with pagination and role controls

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserTable, { AdminUser } from '../../../components/admin/UserTable';
import { fetchUsers, changeUserRole, disableUser } from '../../../services/adminUserService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = (await fetchUsers({ limit, offset: page * limit })) as AdminUser[];
      setUsers(data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, page]);

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await changeUserRole(id, role);
      showSuccess('Role updated');
      load();
    } catch {}
  };

  const handleDeactivate = async (id: number) => {
    try {
      await disableUser(id);
      showSuccess('User deactivated');
      load();
    } catch {}
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">User Management</h1>
      {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && <UserTable users={users} onRoleChange={handleRoleChange} onDeactivate={handleDeactivate} />}
      <div className="flex space-x-4">
        <button className="px-4 py-2 bg-gray-200 rounded" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
          Previous
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
