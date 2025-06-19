'use client';
// Page allowing users to refine their goals using journal context

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchGoals, refineGoals } from '../../../services/goalService';
import { fetchJournalTags } from '../../../services/journalService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../../components/ToastProvider';

// Shape describing a goal returned from the backend
interface Goal {
  id: number;
  content: string;
  created_at: string;
}

export default function GoalRefinePage() {
  const router = useRouter(); // Notes: Used for auth redirects
  // Notes: Store current goals retrieved from the backend
  const [goals, setGoals] = useState<Goal[]>([]);
  // Notes: Store journal tags extracted via AI
  const [tags, setTags] = useState<string[]>([]);
  // Notes: Store the refined goals returned by the AI service
  const [refined, setRefined] = useState<string[]>([]);
  // Notes: Track network loading state
  const [loading, setLoading] = useState(false);
  // Notes: Track any error that occurs during requests
  const [error, setError] = useState('');

  // Notes: Load existing goals and journal tags on first render
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Notes: Redirect to login when the session has expired
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const g = await fetchGoals();
        const t = await fetchJournalTags();
        setGoals(g);
        setTags(t);
      } catch {
        // Notes: Surface a friendly message when requests fail
        setError('Failed to load data');
      }
    };
    loadData();
  }, [router]);

  // Notes: Handler that submits goals and tags for refinement
  const handleRefine = async () => {
    setLoading(true);
    setError('');
    try {
      const improved = await refineGoals(
        goals.map((g) => g.content),
        tags
      );
      setRefined(improved);
    } catch {
      setError('Failed to refine goals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Refine Goals</h1>

      {/* Button to trigger refinement */}
      <button
        onClick={handleRefine}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refine My Goals
      </button>

      {/* Loading spinner */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Error message */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Display current goals and tags */}
      <div className="w-full max-w-md space-y-4">
        <div>
          <h2 className="font-semibold mb-2">Current Goals</h2>
          <ul className="list-disc list-inside space-y-1">
            {goals.map((g) => (
              <li key={g.id}>{g.content}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Journal Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="px-2 py-1 text-sm bg-gray-200 rounded">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Display AI refined goals when available */}
      {refined.length > 0 && (
        <div className="w-full max-w-md">
          <h2 className="font-semibold mb-2">Refined Goals</h2>
          <ul className="list-disc list-inside space-y-1">
            {refined.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
