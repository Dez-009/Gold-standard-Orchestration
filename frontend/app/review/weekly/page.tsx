'use client';

// Weekly review summary page displayed under /review/weekly
// Notes: Fetches AI generated summary from the backend on mount
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWeeklyReview } from '../../../services/reviewService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface WeeklySummary {
  week_range: string;
  summary: string;
  highlights?: string[];
}

export default function WeeklyReviewSummaryPage() {
  const router = useRouter(); // Notes: Used for navigation on auth failure
  const [summary, setSummary] = useState<WeeklySummary | null>(null); // Notes: Holds fetched summary
  const [loading, setLoading] = useState(true); // Notes: Indicates active fetch
  const [error, setError] = useState(''); // Notes: Stores error message for UI

  // Notes: Retrieve the weekly summary once the component mounts
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Notes: Expired sessions redirect users back to login
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const loadSummary = async () => {
      try {
        const data = await fetchWeeklyReview();
        setSummary(data);
      } catch {
        setError('Failed to load weekly summary');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 p-4">
      {/* Link back to dashboard for easy navigation */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page header */}
      <h1 className="text-2xl font-bold">Weekly Review Summary</h1>
      {/* Loading spinner while request is in progress */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Error message on failure */}
      {error && <p className="text-red-600">{error}</p>}
      {/* Empty state when no summary has been generated */}
      {!loading && !error && !summary && <p>No summary available yet.</p>}
      {/* Render the summary details when available */}
      {summary && (
        <div className="border rounded p-4 bg-gray-100 w-full max-w-md space-y-2">
          <h2 className="text-lg font-semibold">Week of {summary.week_range}</h2>
          <p>{summary.summary}</p>
          {summary.highlights && summary.highlights.length > 0 && (
            <ul className="list-disc list-inside">
              {summary.highlights.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
