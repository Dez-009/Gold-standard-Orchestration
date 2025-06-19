'use client';
// Page visualizing historical mood data with a chart and summary stats

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchMoodTrends } from '../../../services/moodTrendService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

// Shape of each record returned by the backend
interface MoodHistory {
  date: string;
  mood: string;
}

export default function MoodTrendsPage() {
  const router = useRouter(); // Used for authentication redirects
  // Loaded mood history array
  const [history, setHistory] = useState<MoodHistory[]>([]);
  // Track loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper to load mood trend data from the service
  const loadTrends = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMoodTrends();
      setHistory(data);
    } catch {
      setError('Failed to load mood trends');
    } finally {
      setLoading(false);
    }
  };

  // Verify token and fetch data on initial render
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    loadTrends();
  }, [router]);

  // Convert mood strings to numeric scores for charting
  const moodScore = (mood: string) => {
    const map: Record<string, number> = {
      Excellent: 5,
      Good: 4,
      Neutral: 3,
      Stressed: 2,
      'Burned Out': 1,
      Depressed: 0
    };
    return map[mood] ?? 0;
  };

  // Prepare data for the recharts LineChart
  const chartData = history.map((h) => ({
    date: h.date.split('T')[0],
    score: moodScore(h.mood)
  }));

  // Compute summary statistics for display
  const average =
    chartData.reduce((sum, d) => sum + d.score, 0) /
    (chartData.length || 1);
  const freq: Record<string, number> = {};
  history.forEach((h) => {
    freq[h.mood] = (freq[h.mood] || 0) + 1;
  });
  const mostCommon = Object.keys(freq).reduce((a, b) =>
    freq[a] > freq[b] ? a : b
  , '');
  const weekBuckets: Record<string, number[]> = {};
  chartData.forEach((d) => {
    const week = d.date.slice(0, 7);
    if (!weekBuckets[week]) weekBuckets[week] = [];
    weekBuckets[week].push(d.score);
  });
  let bestWeek = '';
  let worstWeek = '';
  let bestAvg = -Infinity;
  let worstAvg = Infinity;
  Object.entries(weekBuckets).forEach(([week, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestWeek = week;
    }
    if (avg < worstAvg) {
      worstAvg = avg;
      worstWeek = week;
    }
  });

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to main dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading */}
      <h1 className="text-2xl font-bold">Mood Trends</h1>

      {/* Placeholder for a future date range picker */}
      <div className="border rounded p-2 text-gray-500">Date range picker</div>

      {/* Loading and error states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && history.length === 0 && <p>No mood data available.</p>}

      {/* Chart and statistics once data is loaded */}
      {!loading && history.length > 0 && (
        <>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="border p-2 rounded text-center">
              <p className="font-semibold">Average Mood</p>
              <p>{average.toFixed(2)}</p>
            </div>
            <div className="border p-2 rounded text-center">
              <p className="font-semibold">Most Common Mood</p>
              <p>{mostCommon}</p>
            </div>
            <div className="border p-2 rounded text-center">
              <p className="font-semibold">Best Week</p>
              <p>{bestWeek}</p>
            </div>
            <div className="border p-2 rounded text-center">
              <p className="font-semibold">Worst Week</p>
              <p>{worstWeek}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
