'use client';
// Goals management page allowing users to create and view personal goals
// Fetches existing goals on mount and refreshes the list after new ones are added

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { saveGoal, fetchGoals } from '../../services/goalService';

interface Goal {
  id: number;
  content: string;
  created_at: string;
}

export default function GoalsPage() {
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

  // Fetch goals on initial render
  useEffect(() => {
    loadGoals();
  }, []);

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Your Goals</h1>

      {/* Form for adding a new goal */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Enter a new goal"
          className="border rounded w-full p-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Goal
        </button>
      </form>

      {/* Display spinner while loading data */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Display error message when something goes wrong */}
      {error && <p className="text-red-600">{error}</p>}

      {/* List of existing goals */}
      <ul className="w-full max-w-md space-y-2">
        {goals.map((goal) => (
          <li key={goal.id} className="border rounded p-4 bg-gray-100">
            <p>{goal.content}</p>
            <p className="text-sm text-gray-600 mt-2">{formatDate(goal.created_at)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
