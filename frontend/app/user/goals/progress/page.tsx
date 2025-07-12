'use client';
// Goal progress tracker page listing all goals with progress bars and actions

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchGoalProgress,
  updateGoalProgress as persistProgress
} from '../../../../services/goalService';
import { trackEvent } from '../../../../services/analyticsService';
import { getToken, isTokenExpired } from '../../../../services/authUtils';
import { showError } from '../../../../components/ToastProvider';

interface GoalProgress {
  id: number;
  title: string;
  target?: number;
  progress?: number;
  updated_at: string;
}

export default function GoalProgressPage() {
  const router = useRouter(); // Notes: Router used for navigation redirects
  // Local state storing the list of goals with their progress metrics
  const [progressList, setProgressList] = useState<GoalProgress[]>([]);
  // Track loading and error status for the API request
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper to retrieve goal progress data from the backend
  const loadProgress = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchGoalProgress();
      setProgressList(data);
    } catch {
      setError('Failed to load goal progress');
    } finally {
      setLoading(false);
    }
  };

  // Notes: Verify token validity on mount then request progress info
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    loadProgress();
  }, [router]);

  // Increment progress locally for a goal and mark the update time
  const incrementProgress = async (id: number) => {
    const goal = progressList.find((g) => g.id === id);
    if (!goal) return;
    const newProgress = Math.min((goal.progress ?? 0) + 10, goal.target ?? 100);
    try {
      await persistProgress(id, newProgress, goal.target);
      trackEvent('goal_progress_increment', { goalId: id, progress: newProgress });
      setProgressList((prev) =>
        prev.map((g) =>
          g.id === id
            ? { ...g, progress: newProgress, updated_at: new Date().toISOString() }
            : g
        )
      );
    } catch {
      showError('Failed to update progress');
    }
  };

  // Helper to show YYYY-MM-DD from ISO timestamp
  const formatDate = (iso: string) => iso.split('T')[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Goal Progress</h1>

      {/* Conditional loading, error, and empty states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && progressList.length === 0 && <p>No goals found.</p>}

      {/* List each goal with progress information */}
      <ul className="w-full max-w-md space-y-4">
        {progressList.map((goal) => (
          <li key={goal.id} className="border rounded p-4 bg-gray-100 space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-semibold">{goal.title}</p>
              <button
                className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => incrementProgress(goal.id)}
              >
                + Progress
              </button>
            </div>
            {goal.target !== undefined && (
              <progress className="w-full h-3" value={goal.progress ?? 0} max={goal.target} />
            )}
            {goal.target !== undefined && (
              <p className="text-sm">
                {Math.round(((goal.progress ?? 0) / goal.target) * 100)}%
              </p>
            )}
            <p className="text-sm text-gray-600">Last updated: {formatDate(goal.updated_at)}</p>
            <button className="text-xs text-gray-500 underline cursor-default" disabled>
              Edit Goal (coming soon)
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
