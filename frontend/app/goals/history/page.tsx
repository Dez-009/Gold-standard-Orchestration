'use client';
// History page listing completed goals in a simple table layout

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCompletedGoals } from '../../../services/goalHistoryService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

// Notes: Type definition describing a completed goal record
interface CompletedGoal {
  id: number;
  title: string;
  category: string;
  completed_at: string;
  notes?: string | null;
}

export default function GoalHistoryPage() {
  const router = useRouter(); // Notes: Router used for navigation on auth failure
  // Local state containing completed goals returned from the backend
  const [goals, setGoals] = useState<CompletedGoal[]>([]);
  // Track loading and error state for the page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to load goal history from the API
  const loadGoals = async () => {
    setLoading(true);
    setError('');
    try {
      // Notes: Retrieve the list of completed goals
      const data = await fetchCompletedGoals();
      // Notes: Sort goals newest first by completion date
      const sorted = data.sort(
        (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
      setGoals(sorted);
    } catch {
      setError('Failed to load completed goals');
    } finally {
      setLoading(false);
    }
  };

  // Notes: On mount verify token validity then fetch history
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    loadGoals();
  }, [router]);

  // Notes: Format ISO timestamps for a concise date string
  const formatDate = (iso: string) => iso.split('T')[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/goals" className="self-start text-blue-600 underline">
        Back to Goals
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Completed Goals</h1>

      {/* Conditional states for loading, error and empty list */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && goals.length === 0 && <p>No completed goals found.</p>}

      {/* Table listing each completed goal */}
      <table className="w-full max-w-2xl table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-left">Completed</th>
            <th className="px-4 py-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => (
            <tr key={goal.id} className="border-t">
              <td className="px-4 py-2">{goal.title}</td>
              <td className="px-4 py-2">{goal.category}</td>
              <td className="px-4 py-2">{formatDate(goal.completed_at)}</td>
              <td className="px-4 py-2">{goal.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
