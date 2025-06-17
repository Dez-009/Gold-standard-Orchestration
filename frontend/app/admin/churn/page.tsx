'use client';
// Admin page displaying user churn risk levels

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchChurnRisks, ChurnRiskRecord } from '../../../services/churnService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AdminChurnPage() {
  const router = useRouter();
  // Notes: Store fetched churn risk records
  const [risks, setRisks] = useState<ChurnRiskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notes: Load risk data on mount with auth checks
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
        const data = await fetchChurnRisks();
        setRisks(data);
      } catch {
        setError('Failed to load churn data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Determine row color based on risk category
  const color = (category: string) => {
    if (category === 'High') return 'bg-red-200';
    if (category === 'Medium') return 'bg-yellow-200';
    return 'bg-green-200';
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Customer Churn Risk</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && risks.length === 0 && <p>No data available.</p>}
      {!loading && !error && risks.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Risk Score</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Calculated At</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.id} className={`odd:bg-gray-100 ${color(r.risk_category)}`}>
                  <td className="border px-4 py-2">{r.user_id}</td>
                  <td className="border px-4 py-2">{r.risk_score.toFixed(2)}</td>
                  <td className="border px-4 py-2">{r.risk_category}</td>
                  <td className="border px-4 py-2">{fmt(r.calculated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
