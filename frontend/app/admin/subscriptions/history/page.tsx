'use client';
// Admin page displaying subscription history records with sorting and search

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchSubscriptionHistory,
  SubscriptionHistoryRecord,
} from '../../../../services/subscriptionHistoryService';
import { getToken, isTokenExpired, isAdmin } from '../../../../services/authUtils';
import { showError } from '../../../../components/ToastProvider';

export default function SubscriptionHistoryPage() {
  const router = useRouter(); // Notes: Router for auth redirects
  // Notes: Local state for history records and UI flags
  const [records, setRecords] = useState<SubscriptionHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof SubscriptionHistoryRecord>('updated_at');
  const [sortAsc, setSortAsc] = useState(false);

  // Notes: Ensure admin privileges and fetch history on mount
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
        // Notes: Request history from the service layer
        const data = await fetchSubscriptionHistory();
        setRecords(data);
      } catch {
        setError('Unable to fetch subscription history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Filter records by user email text
  const filtered = records.filter((r) =>
    r.user_email.toLowerCase().includes(search.toLowerCase())
  );

  // Notes: Sort filtered records based on selected column
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === null || valB === null) {
      return 0;
    }
    const compA = typeof valA === 'string' ? valA : String(valA);
    const compB = typeof valB === 'string' ? valB : String(valB);
    return sortAsc ? compA.localeCompare(compB) : compB.localeCompare(compA);
  });

  // Notes: Toggle sorting by column header
  const handleSort = (field: keyof SubscriptionHistoryRecord) => {
    setSortField((prev) => (prev === field ? prev : field));
    setSortAsc((prev) => (field === sortField ? !prev : true));
  };

  // Notes: Helper to format ISO dates
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : 'N/A');

  // Notes: Render table rows for each history record
  const renderRows = () =>
    sorted.map((rec, idx) => (
      <tr key={idx} className="odd:bg-gray-100">
        <td className="border px-4 py-2 break-all">{rec.user_email}</td>
        <td className="border px-4 py-2 break-all">
          {rec.stripe_subscription_id}
        </td>
        <td className="border px-4 py-2 capitalize">{rec.status}</td>
        <td className="border px-4 py-2">{fmt(rec.start_date)}</td>
        <td className="border px-4 py-2">{fmt(rec.end_date)}</td>
        <td className="border px-4 py-2">{fmt(rec.updated_at)}</td>
      </tr>
    ));

  // Notes: Helper to render sortable table headers
  const SortableHeader = ({ field, label }: { field: keyof SubscriptionHistoryRecord; label: string }) => (
    <th
      className="px-4 py-2 cursor-pointer select-none"
      onClick={() => handleSort(field)}
    >
      {label} {sortField === field ? (sortAsc ? '▲' : '▼') : ''}
    </th>
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Subscription History</h1>
      {/* Search input */}
      <input
        type="text"
        placeholder="Search by email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full max-w-sm"
      />
      {/* Loading, error and empty states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && sorted.length === 0 && <p>No history records found.</p>}
      {/* Table of history records */}
      {!loading && !error && sorted.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <SortableHeader field="user_email" label="Email" />
                <SortableHeader field="stripe_subscription_id" label="Subscription ID" />
                <SortableHeader field="status" label="Status" />
                <SortableHeader field="start_date" label="Start" />
                <SortableHeader field="end_date" label="End" />
                <SortableHeader field="updated_at" label="Last Updated" />
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
