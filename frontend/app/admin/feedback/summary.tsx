'use client';
// Admin dashboard page showing aggregated feedback metrics

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchFeedbackSummary, FeedbackSummaryResponse, AgentFeedbackSummary } from '../../../services/feedbackAnalyticsService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function FeedbackSummaryPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<FeedbackSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFlagged, setShowFlagged] = useState(true); // Toggle display of flagged counts

  // Validate auth and load metrics on mount
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
        const data = await fetchFeedbackSummary();
        setSummary(data);
      } catch {
        setError('Failed to load summary');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const agentEntries = Object.entries(summary || {});

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Feedback Summary</h1>
      <label className="flex items-center space-x-2">
        <input type="checkbox" checked={showFlagged} onChange={() => setShowFlagged((v) => !v)} />
        <span>Show Flagged Count</span>
      </label>
      {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && agentEntries.length === 0 && <p>No feedback data.</p>}
      {!loading && !error && agentEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
          {agentEntries.map(([name, data]) => {
            const d = data as AgentFeedbackSummary;
            const bars = [
              { name: 'Likes', value: d.likes },
              { name: 'Dislikes', value: d.dislikes }
            ];
            return (
              <div key={name} className="border rounded p-4 space-y-2">
                <h2 className="text-lg font-semibold">{name}</h2>
                <div className="w-full h-32">
                  <ResponsiveContainer>
                    <BarChart data={bars}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4ade80" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between px-2">
                  <span>{d.likes} 👍</span>
                  <span>{d.dislikes} 👎</span>
                </div>
                <div className="flex items-center space-x-2 px-2">
                  <span>{d.average_rating.toFixed(1)} ⭐</span>
                  {showFlagged && (
                    <span className="bg-red-100 text-red-800 px-2 rounded" title="Flagged summaries">
                      {d.flagged} flagged
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
