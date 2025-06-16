'use client';
// Admin page listing all user submitted support tickets
// Notes: Allows filtering, sorting and inline status updates

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchSupportTickets,
  updateTicketStatus
} from '../../../services/supportService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

// Shape of a support ticket returned by the backend
interface Ticket {
  id: number;
  user_email: string;
  category: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function SupportTicketsPage() {
  const router = useRouter(); // Notes: Router for navigation and redirects
  // Notes: Local state for tickets, search filter and UI flags
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  // Notes: Verify admin authentication and load tickets on mount
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
        // Request all support tickets via the service helper
        const data = await fetchSupportTickets();
        setTickets(data);
      } catch {
        // Show a friendly message when retrieval fails
        setError('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Handle status dropdown change for a given ticket
  const changeStatus = async (id: number, status: string) => {
    try {
      await updateTicketStatus(id, status);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    } catch {
      showError('Failed to update status');
    }
  };

  // Notes: Filter tickets by search term and sort by date
  const filtered = tickets
    .filter((t) => {
      const term = search.toLowerCase();
      return (
        t.user_email.toLowerCase().includes(term) ||
        t.subject.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const val =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortAsc ? val : -val;
    });

  // Notes: Helper to display dates in locale format
  const fmt = (d: string) => new Date(d).toLocaleDateString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading and controls */}
      <h1 className="text-2xl font-bold">Support Tickets</h1>
      <div className="flex space-x-2 w-full max-w-md">
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sort {sortAsc ? '↑' : '↓'}
        </button>
      </div>
      {/* Loading and error states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>No tickets found.</p>}
      {/* Tickets table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="odd:bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`/admin/support/${t.id}`)}
                >
                  <td className="border px-4 py-2">{t.id}</td>
                  <td className="border px-4 py-2">{t.user_email}</td>
                  <td className="border px-4 py-2">{t.category}</td>
                  <td className="border px-4 py-2">{t.subject}</td>
                  <td className="border px-4 py-2">
                    <select
                      value={t.status}
                      onChange={(e) => changeStatus(t.id, e.target.value)}
                      className="border rounded p-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </td>
                  <td className="border px-4 py-2">{fmt(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
