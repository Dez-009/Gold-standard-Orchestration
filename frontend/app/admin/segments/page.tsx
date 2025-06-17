'use client';
// Admin page for creating and evaluating user segments

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchSegments,
  createSegment,
  updateSegment,
  removeSegment,
  fetchSegmentUsers,
  UserSegment
} from '../../../services/segmentationService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AdminSegmentsPage() {
  const router = useRouter();
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, any[]>>({});
  const [form, setForm] = useState({ name: '', description: '', criteria: '{}' });

  // Validate session and load segments on mount
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
        const data = await fetchSegments();
        setSegments(data);
      } catch {
        setError('Failed to load segments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Handle submit for create or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description,
        criteria: JSON.parse(form.criteria)
      };
      if (selected) {
        await updateSegment(selected, payload);
      } else {
        await createSegment(payload);
      }
      const data = await fetchSegments();
      setSegments(data);
      setForm({ name: '', description: '', criteria: '{}' });
      setSelected(null);
    } catch {
      setError('Failed to save segment');
    }
  };

  // Handle deletion
  const handleDelete = async (id: string) => {
    try {
      await removeSegment(id);
      const data = await fetchSegments();
      setSegments(data);
    } catch {
      setError('Failed to delete segment');
    }
  };

  // Evaluate segment
  const handleEvaluate = async (id: string) => {
    try {
      const result = await fetchSegmentUsers(id);
      setUsers({ ...users, [id]: result });
    } catch {
      setError('Failed to evaluate segment');
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">User Segments</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="w-full max-w-3xl space-y-4">
          <form onSubmit={handleSubmit} className="border p-4 rounded space-y-2">
            <h2 className="font-semibold">{selected ? 'Edit Segment' : 'New Segment'}</h2>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="border p-1 w-full rounded"
              required
            />
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              className="border p-1 w-full rounded"
            />
            <textarea
              value={form.criteria}
              onChange={(e) => setForm({ ...form, criteria: e.target.value })}
              className="border p-1 w-full rounded font-mono text-sm"
              rows={4}
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
              >
                {selected ? 'Update' : 'Create'}
              </button>
              {selected && (
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setForm({ name: '', description: '', criteria: '{}' });
                  }}
                  className="bg-gray-400 text-white py-1 px-3 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((seg) => (
                  <tr key={seg.id} className="odd:bg-gray-100">
                    <td className="border px-4 py-2">{seg.name}</td>
                    <td className="border px-4 py-2">{fmt(seg.created_at)}</td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => {
                          setSelected(seg.id);
                          setForm({
                            name: seg.name,
                            description: seg.description,
                            criteria: JSON.stringify(seg.criteria, null, 2)
                          });
                        }}
                        className="bg-green-600 text-white py-1 px-2 rounded hover:bg-green-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(seg.id)}
                        className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleEvaluate(seg.id)}
                        className="bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700"
                      >
                        Evaluate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {segments.map((seg) =>
            users[seg.id] ? (
              <div key={seg.id} className="border p-2 rounded">
                <h3 className="font-semibold">Users for {seg.name}</h3>
                <ul className="list-disc list-inside">
                  {users[seg.id].map((u) => (
                    <li key={u.id}>{u.email}</li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
