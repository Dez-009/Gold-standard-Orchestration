'use client';
// Page listing AI-generated goal suggestions in card format

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchGoalSuggestions } from '../../../services/goalSuggestionService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../../components/ToastProvider';

// Notes: Shape of a suggestion returned by the backend service
interface GoalSuggestion {
  id: number;
  description: string;
  category: string;
}

export default function GoalSuggestionsPage() {
  const router = useRouter(); // Notes: Router used for auth redirects
  // Local state storing the fetched suggestions
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  // Loading and error state for the fetch request
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper that requests suggestions from the backend service
  const loadSuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchGoalSuggestions();
      setSuggestions(data);
    } catch {
      // Notes: Set a friendly error message when the request fails
      setError('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Notes: Validate session and fetch suggestions on first render
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Notes: Clear token and redirect when session expired
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    loadSuggestions();
  }, [router]);

  // Placeholder actions for accepting or dismissing a suggestion
  const handleAccept = (id: number) => {
    alert(`Accepted suggestion ${id}`);
  };
  const handleDismiss = (id: number) => {
    alert(`Dismissed suggestion ${id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading */}
      <h1 className="text-2xl font-bold">Goal Suggestions</h1>

      {/* Conditional states for loading and errors */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && suggestions.length === 0 && <p>No suggestions available.</p>}

      {/* Render suggestions as styled cards */}
      <ul className="w-full max-w-md space-y-4">
        {suggestions.map((s) => (
          <li key={s.id} className="border rounded p-4 bg-white shadow space-y-2">
            <p className="font-semibold">{s.description}</p>
            <p className="text-sm text-gray-600">Category: {s.category}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleAccept(s.id)}
                className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={() => handleDismiss(s.id)}
                className="px-2 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
