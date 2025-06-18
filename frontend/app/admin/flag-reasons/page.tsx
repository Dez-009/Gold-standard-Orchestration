'use client';

// Admin page for managing structured flag reasons

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getFlagReasons,
  createFlagReason,
  deleteFlagReason
} from '../../../services/apiClient';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

interface ReasonRow {
  id: string;
  label: string;
  category?: string | null;
  created_at: string;
}

export default function FlagReasonAdminPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ReasonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('');

  const load = async () => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getFlagReasons(token);
      setRows(data);
    } catch {
      setError('Failed to load reasons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const created = await createFlagReason(token, {
        label,
        category: category || undefined
      });
      setRows([created, ...rows]);
      setLabel('');
      setCategory('');
      showSuccess('Reason added');
    } catch {
      showError('Failed to create reason');
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await deleteFlagReason(token, id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      showSuccess('Reason deleted');
    } catch {
      showError('Failed to delete reason');
    }
  };

  const badge = (cat?: string | null) => {
    if (!cat) return null;
    const colors: Record<string, string> = {
      Safety: 'bg-red-100 text-red-800',
      Quality: 'bg-blue-100 text-blue-800',
      Relevance: 'bg-green-100 text-green-800'
    };
    const cls = colors[cat] || 'bg-gray-100 text-gray-800';
    return <span className={`${cls} px-2 py-0.5 rounded text-xs`}>{cat}</span>;
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Flag Reasons</h1>
      <div className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
          className="border p-1 rounded"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="border p-1 rounded"
        />
        <button onClick={handleAdd} className="px-3 py-1 border rounded">
          Add
        </button>
      </div>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No reasons defined.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">Label</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{r.label}</td>
                  <td className="border px-4 py-2 text-center">{badge(r.category)}</td>
                  <td className="border px-4 py-2">{fmt(r.created_at)}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                    >
                      Delete
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
