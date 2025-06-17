'use client';
// Admin revenue overview page displaying key financial metrics

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchRevenueSummary, RevenueSummary } from '../../../services/revenueService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function RevenuePage() {
  const router = useRouter(); // Notes: Used for navigation and redirects
  const [data, setData] = useState<RevenueSummary | null>(null); // Notes: Metrics state
  const [loading, setLoading] = useState(true); // Notes: Loading indicator
  const [error, setError] = useState(''); // Notes: Error message storage

  // Verify admin access and load metrics on mount
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
        // Notes: Request revenue summary from the service layer
        const resp = await fetchRevenueSummary();
        setData(resp);
      } catch {
        setError('Failed to load revenue metrics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Reusable card component for displaying a single metric
  const MetricCard = ({ label, value }: { label: string; value: number }) => (
    <div className="border rounded p-4 shadow-md flex flex-col items-center">
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      <span className="text-2xl font-bold text-blue-600">{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Revenue Summary</h1>
      {/* Loading spinner and error message handling */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {/* Metrics grid when data is present */}
      {!loading && !error && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
          <MetricCard label="Active Subs" value={data.active_subscriptions} />
          <MetricCard label="MRR" value={data.mrr} />
          <MetricCard label="ARR" value={data.arr} />
          <MetricCard label="Lifetime Rev" value={data.lifetime_revenue} />
        </div>
      )}
    </div>
  );
}
