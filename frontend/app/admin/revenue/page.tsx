'use client';
// Admin revenue overview page displaying key financial metrics

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchRevenueReport, RevenueReport } from '../../../services/revenueService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function RevenuePage() {
  const router = useRouter(); // Notes: Used for navigation and redirects
  const [data, setData] = useState<RevenueReport | null>(null); // Notes: Metrics state
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
        // Notes: Request detailed revenue report from the service layer
        const resp = await fetchRevenueReport();
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
      <h1 className="text-2xl font-bold">Revenue Report</h1>
      {/* Loading spinner and error message handling */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {/* Metrics grid when data is present */}
      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full max-w-6xl">
            <MetricCard label="MRR" value={data.mrr} />
            <MetricCard label="ARR" value={data.arr} />
            <MetricCard label="ARPU" value={data.arpu} />
            <MetricCard label="Growth %" value={data.revenue_growth} />
            <MetricCard label="Subscribers" value={data.active_subscribers} />
            <MetricCard label="Churned" value={data.churned_subscribers} />
          </div>
          {/* Placeholder for future revenue trend chart */}
          <div className="bg-gray-200 w-full max-w-6xl h-48 rounded flex items-center justify-center mt-4">
            <span className="text-gray-600">Revenue Trend Chart</span>
          </div>
        </>
      )}
    </div>
  );
}
