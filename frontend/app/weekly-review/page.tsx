'use client';

// Weekly review overview page located at /weekly-review
// Notes: Fetches aggregated data from the backend on mount
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWeeklyReview } from '../../services/weeklyReviewService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

// Shape of the summary object returned by the backend
interface WeeklyReview {
  avg_mood: number;
  journal_count: number;
  goal_progress: Array<{ name: string; percent_complete: number }>;
  ai_insights: string;
}

export default function WeeklyReviewPage() {
  const router = useRouter(); // Notes: Used for navigation when auth fails
  const [review, setReview] = useState<WeeklyReview | null>(null); // Notes: Holds fetched data
  const [loading, setLoading] = useState(true); // Notes: Indicates data fetch in progress
  const [error, setError] = useState(''); // Notes: Stores message for failures

  // Helper to map a numeric mood to a color class and emoji
  const moodInfo = (score: number) => {
    if (score >= 4) return { color: 'bg-green-200', emoji: '😄' };
    if (score >= 3) return { color: 'bg-yellow-200', emoji: '🙂' };
    if (score >= 2) return { color: 'bg-orange-200', emoji: '😟' };
    return { color: 'bg-red-200', emoji: '😞' };
  };

  // Notes: Load the weekly summary when the component mounts
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Notes: Redirect unauthenticated users back to login
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const loadReview = async () => {
      try {
        const data = await fetchWeeklyReview();
        setReview(data);
      } catch {
        setError('Failed to load weekly overview');
      } finally {
        setLoading(false);
      }
    };
    loadReview();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to the dashboard page */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Weekly Overview</h1>
      {/* Display a spinner while loading */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Display an error message when fetching fails */}
      {error && <p className="text-red-600">{error}</p>}
      {/* Inform the user when no data was returned */}
      {!loading && !error && !review && <p>No data available.</p>}
      {/* Render summary cards when data is present */}
      {review && (
        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          {/* Mood summary card */}
          <div className={`p-4 rounded ${moodInfo(review.avg_mood).color}`}>
            <h2 className="font-semibold mb-2">Average Mood</h2>
            <p className="text-3xl">
              {moodInfo(review.avg_mood).emoji} {review.avg_mood.toFixed(1)} / 5
            </p>
          </div>
          {/* Journal count card */}
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-semibold mb-2">Journals This Week</h2>
            <p>{review.journal_count}</p>
          </div>
          {/* Goal progress card */}
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-semibold mb-2">Goal Progress</h2>
            {review.goal_progress.length === 0 ? (
              <p>No goals tracked.</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {review.goal_progress.map((g) => (
                  <li key={g.name}>
                    {g.name}: {g.percent_complete}%
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* AI insights card */}
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-semibold mb-2">AI Insights</h2>
            <p>{review.ai_insights}</p>
          </div>
        </div>
      )}
    </div>
  );
}
