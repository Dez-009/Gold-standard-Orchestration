'use client';
// Admin page displaying user churn risk levels

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchChurnScores,
  runChurnRecalculation,
  ChurnScoreRecord
} from '../../../services/churnService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AdminChurnPage() {
  const router = useRouter();
  // Notes: Store fetched churn risk records
  const [scores, setScores] = useState<ChurnScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notes: Load churn scores on mount with auth checks
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
        const data = await fetchChurnScores();
        setScores(data);
      } catch {
        setError('Failed to load churn data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Determine row color based on risk category
  const color = (score: number) => {
    if (score >= 0.66) return 'bg-red-200';
    if (score >= 0.33) return 'bg-yellow-200';
    return 'bg-green-200';
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Customer Churn Risk</h1>
      <button
        onClick={async () => {
          setLoading(true);
          try {
            await runChurnRecalculation();
            const data = await fetchChurnScores();
            setScores(data);
          } catch {
            showError('Failed to recalculate');
          } finally {
            setLoading(false);
          }
        }}
        className="px-4 py-2 border rounded bg-blue-500 text-white"
      >
        Recalculate
      </button>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && scores.length === 0 && <p>No data available.</p>}
      {!loading && !error && scores.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Risk %</th>
                <th className="px-4 py-2">Reasons</th>
                <th className="px-4 py-2">Calculated At</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((r) => (
                <tr key={r.id} className={`odd:bg-gray-100 ${color(r.churn_risk)}`}>
                  <td className="border px-4 py-2">{r.user_id}</td>
                  <td className="border px-4 py-2">{(r.churn_risk * 100).toFixed(0)}%</td>
                  <td className="border px-4 py-2">{r.reasons ?? ''}</td>
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
