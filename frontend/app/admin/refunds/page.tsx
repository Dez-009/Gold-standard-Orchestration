'use client';
// Admin page listing recent payments and allowing manual refunds

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchRecentPayments,
  issueRefund,
  PaymentRecord,
} from '../../../services/refundService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function RefundsPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Notes: State tracking the list of payments returned from the backend
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  // Notes: UI state flags for loading, errors and sorting
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  // Notes: Track which charge is being confirmed for refund
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Notes: Verify admin session then load payments on mount
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
        // Notes: Request recent payments from the backend
        const data = await fetchRecentPayments();
        setPayments(data);
      } catch {
        setError('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Toggle between ascending and descending sort by date
  const toggleSort = () => setSortAsc((prev) => !prev);

  // Notes: Sort payments based on the creation timestamp
  const sorted = [...payments].sort((a, b) =>
    sortAsc
      ? a.created - b.created
      : b.created - a.created
  );

  // Notes: Helper to format Unix timestamps for display
  const fmtDate = (ts: number) => new Date(ts * 1000).toLocaleString();
  const fmtAmount = (amt: number) => `$${amt.toFixed(2)}`;

  // Notes: Trigger the refund call and refresh the table
  const handleRefund = async (chargeId: string) => {
    setProcessing(true);
    try {
      await issueRefund(chargeId);
      // Remove the refunded payment from the list
      setPayments((prev) => prev.filter((p) => p.charge_id !== chargeId));
    } catch {
      // Error toast handled inside the service
    } finally {
      setProcessing(false);
      setConfirmId(null);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Refund Payments</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && payments.length === 0 && <p>No payments found.</p>}
      {!loading && !error && payments.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Charge ID</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2 cursor-pointer" onClick={toggleSort}>
                  Date {sortAsc ? '▲' : '▼'}
                </th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((pay) => (
                <tr key={pay.charge_id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2 break-all">{pay.charge_id}</td>
                  <td className="border px-4 py-2">{pay.email ?? 'N/A'}</td>
                  <td className="border px-4 py-2">{fmtDate(pay.created)}</td>
                  <td className="border px-4 py-2">{fmtAmount(pay.amount)}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => setConfirmId(pay.charge_id)}
                      disabled={processing}
                      className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {processing && confirmId === pay.charge_id ? 'Refunding...' : 'Refund'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {confirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded space-y-4">
            <p>Are you sure you want to refund this payment?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setConfirmId(null)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={() => handleRefund(confirmId)}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                {processing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
