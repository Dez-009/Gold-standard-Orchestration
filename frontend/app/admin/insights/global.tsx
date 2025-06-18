'use client';
// Admin dashboard page showing global platform insights

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchGlobalInsights, GlobalInsights } from '../../../services/globalInsightsService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';
import { FiBookOpen, FiUser, FiSmile } from 'react-icons/fi';

export default function GlobalInsightsPage() {
  const router = useRouter();
  const [data, setData] = useState<GlobalInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const resp = await fetchGlobalInsights();
        setData(resp);
      } catch {
        setError('Failed to load insights');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const Card = ({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: JSX.Element }) => (
    <div className={`p-4 rounded shadow-md text-center ${color}`}> 
      <div className="flex justify-center mb-2 text-2xl">{icon}</div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Global Insights</h1>
      {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          <Card label="Journals (7d)" value={data.journals_last_7d} color="bg-blue-100" icon={<FiBookOpen />} />
          <Card label="Top Agent" value={data.top_agent || 'N/A'} color="bg-green-100" icon={<FiUser />} />
          <Card label="Top Feedback" value={data.top_feedback_reason || 'N/A'} color="bg-green-100" icon={<FiUser />} />
          <Card label="Avg Mood" value={data.avg_mood.toFixed(2)} color="bg-yellow-100" icon={<FiSmile />} />
          <Card label="Weekly Active" value={data.weekly_active_users} color="bg-blue-100" icon={<FiUser />} />
        </div>
      )}
      {!loading && !error && !data && <p>No insight data available.</p>}
    </div>
  );
}
