'use client';
// Goals management page allowing users to create and view personal goals
// Fetches existing goals on mount and refreshes the list after new ones are added

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveGoal, fetchGoals } from '../../../services/goalService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';
import FusionBackground from '../../../components/FusionBackground';

interface Goal {
  id: number;
  content: string;
  created_at: string;
}

export default function GoalsPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Local state for list of goals retrieved from the backend
  const [goals, setGoals] = useState<Goal[]>([]);
  // Holds the text input for a new goal
  const [newGoal, setNewGoal] = useState('');
  // Track loading status for fetch and submit actions
  const [loading, setLoading] = useState(false);
  // Store an error message when a request fails
  const [error, setError] = useState('');

  // Helper to load goals from the backend service
  const loadGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchGoals();
      setGoals(data);
    } catch {
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  // Notes: Ensure valid session then fetch goals on initial render
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

  // Handler for submitting a new goal to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setLoading(true);
    setError('');
    try {
      await saveGoal(newGoal);
      setNewGoal('');
      await loadGoals();
    } catch {
      setError('Failed to save goal');
      setLoading(false);
    }
  };

  // Format ISO date strings as YYYY-MM-DD for display
  const formatDate = (iso: string) => iso.split('T')[0];

  return (
    <FusionBackground>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
        {/* Navigation back to dashboard */}
        <Link 
          href="/dashboard" 
          className="self-start text-white hover:text-blue-200 transition-colors duration-200 underline"
        >
          ← Back to Dashboard
        </Link>

        {/* Heading for the page */}
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Your Goals
        </h1>

        {/* Link to view completed goals history */}
        <Link 
          href="/user/goals/history" 
          className="text-white hover:text-blue-200 transition-colors duration-200 underline"
        >
          View Completed Goals
        </Link>

        {/* Form for adding a new goal */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Enter a new goal"
            className="w-full p-3 rounded-lg glass-card text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-lg hover:bg-white/30 transition-all duration-200 font-semibold"
          >
            Add Goal
          </button>
        </form>

        {/* Display spinner while loading data */}
        {loading && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        )}
        
        {/* Display error message when something goes wrong */}
        {error && (
          <p className="text-red-200 bg-red-500/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* List of existing goals */}
        <ul className="w-full max-w-md space-y-4">
          {goals.map((goal) => (
            <li key={goal.id} className="glass-card rounded-lg p-6 text-white">
              <p className="text-lg mb-2">{goal.content}</p>
              <p className="text-sm text-white/70">{formatDate(goal.created_at)}</p>
            </li>
          ))}
        </ul>
      </div>
    </FusionBackground>
  );
}
