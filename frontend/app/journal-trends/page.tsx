'use client';

// Journal trend analytics page under /journal-trends
// Notes: Displays mood and goal progress patterns
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJournalTrends } from '../../services/journalTrendService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

interface TrendData {
  mood_summary: unknown;
  keyword_trends: Record<string, number>;
  goal_progress_notes: string;
}

export default function JournalTrendsPage() {
  const router = useRouter(); // Notes: For auth redirects
  const [trends, setTrends] = useState<TrendData | null>(null); // Notes: Trend data
  const [loading, setLoading] = useState(true); // Notes: Loading state
  const [error, setError] = useState(''); // Notes: Error message

  // Notes: Load trends on initial render
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Notes: Clear invalid token and redirect
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const loadTrends = async () => {
      try {
        const data = await fetchJournalTrends();
        setTrends(data as TrendData);
      } catch {
        setError('Failed to load journal trends');
      } finally {
        setLoading(false);
      }
    };
    loadTrends();
  }, [router]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Journal Trends</h1>
      {/* Loading spinner */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Error text */}
      {error && <p className="text-red-600">{error}</p>}
      {/* Trend content */}
      {trends && (
        <div className="grid gap-4 w-full max-w-md">
          <div className="border p-2 rounded">
            <p className="font-semibold">Mood Summary</p>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(trends.mood_summary, null, 2)}
            </pre>
          </div>
          <div className="border p-2 rounded">
            <p className="font-semibold">Keyword Trends</p>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(trends.keyword_trends, null, 2)}
            </pre>
          </div>
          <div className="border p-2 rounded">
            <p className="font-semibold">Goal Progress</p>
            <p>{trends.goal_progress_notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
