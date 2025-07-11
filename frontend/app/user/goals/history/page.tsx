'use client';
// History page listing completed goals in a simple table layout

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCompletedGoals } from '../../../../services/goalHistoryService';
import { getToken, isTokenExpired } from '../../../../services/authUtils';
import { showError } from '../../../../components/ToastProvider';
import FusionBackground from '../../../../components/FusionBackground';

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
        (a: CompletedGoal, b: CompletedGoal) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
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
    <FusionBackground>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
        {/* Navigation back to dashboard */}
        <Link 
          href="/user/goals" 
          className="self-start text-white hover:text-blue-200 transition-colors duration-200 underline"
        >
          ← Back to Goals
        </Link>

        {/* Page heading */}
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Completed Goals
        </h1>

        {/* Conditional states for loading, error and empty list */}
        {loading && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        )}
        
        {error && (
          <p className="text-red-200 bg-red-500/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            {error}
          </p>
        )}
        
        {!loading && goals.length === 0 && (
          <p className="text-white/80 text-lg">No completed goals found.</p>
        )}

        {/* Table listing each completed goal */}
        <div className="w-full max-w-4xl overflow-x-auto">
          <div className="glass-card rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-6 py-4 text-left text-white font-semibold">Title</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Completed</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((goal, index) => (
                  <tr 
                    key={goal.id} 
                    className={`${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/15 transition-colors duration-200`}
                  >
                    <td className="px-6 py-4 text-white">{goal.title}</td>
                    <td className="px-6 py-4 text-white/80">{goal.category}</td>
                    <td className="px-6 py-4 text-white/80">{formatDate(goal.completed_at)}</td>
                    <td className="px-6 py-4 text-white/70">{goal.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FusionBackground>
  );
}
