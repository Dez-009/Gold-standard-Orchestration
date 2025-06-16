'use client';
// Admin page listing all user subscriptions in a simple table

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAllSubscriptions, SubscriptionRecord } from '../../../services/subscriptionService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function SubscriptionsPage() {
  const router = useRouter(); // Notes: Router used for navigation and redirects
  // Notes: Local state storing the list of subscriptions
  const [subs, setSubs] = useState<SubscriptionRecord[]>([]);
  // Notes: Track loading and error messages for UI feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Notes: Filter text for searching by email address
  const [search, setSearch] = useState('');

  // Notes: Validate token and admin role then fetch subscriptions on mount
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
        // Notes: Retrieve all subscriptions from the backend
        const data = await fetchAllSubscriptions();
        setSubs(data);
      } catch {
        // Notes: Show a human friendly error toast on failure
        setError('Unable to fetch subscriptions');
        showError('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Case-insensitive filtering by user email
  const filtered = subs.filter((s) =>
    s.user_email.toLowerCase().includes(search.toLowerCase())
  );

  // Notes: Format ISO date strings into a readable format
  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString() : 'N/A';

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      {/* Search input field for filtering */}
      <input
        type="text"
        placeholder="Search by email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full max-w-sm"
      />
      {/* Loading spinner, error message and empty state handling */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>No subscriptions found.</p>}
      {/* Table of subscription records when data is available */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Start</th>
                <th className="px-4 py-2">Next Billing</th>
                <th className="px-4 py-2">Provider</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.user_email + sub.start_date} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{sub.user_email}</td>
                  <td className="border px-4 py-2">{sub.plan}</td>
                  <td className="border px-4 py-2">{sub.status}</td>
                  <td className="border px-4 py-2">{fmt(sub.start_date)}</td>
                  <td className="border px-4 py-2">{fmt(sub.next_billing_date)}</td>
                  <td className="border px-4 py-2">{sub.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
