'use client';
// Mood tracking page allowing the user to record how they feel today
// Provides large emoji buttons and shows the currently selected mood

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchMood, submitMood } from '../../services/moodService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

// Shape of the mood record returned by the backend
interface MoodRecord {
  mood: string;
  date: string;
}

export default function MoodPage() {
  const router = useRouter(); // Notes: Router for redirection on auth failure
  // Store the currently recorded mood for today
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  // Track loading state for initial fetch and submissions
  const [loading, setLoading] = useState(false);
  // Hold any error message to display to the user
  const [error, setError] = useState('');
  // Flag indicating a successful update
  const [success, setSuccess] = useState(false);

  // Helper to load today's mood from the backend service
  const loadMood = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMood();
      setCurrentMood(data ? data.mood : null);
    } catch {
      setError('Failed to load mood');
    } finally {
      setLoading(false);
    }
  };

  // Notes: Verify session and fetch mood on initial render
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    loadMood();
  }, [router]);

  // Handler when a mood button is clicked
  const handleSelect = async (mood: string) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await submitMood(mood);
      setCurrentMood(mood);
      setSuccess(true);
    } catch {
      setError('Failed to submit mood');
    } finally {
      setLoading(false);
    }
  };

  // Predefined mood options with emoji labels
  const moods = [
    { label: 'Excellent 😄', value: 'Excellent' },
    { label: 'Good 🙂', value: 'Good' },
    { label: 'Neutral 😐', value: 'Neutral' },
    { label: 'Stressed 😟', value: 'Stressed' },
    { label: 'Burned Out 😫', value: 'Burned Out' },
    { label: 'Depressed 😞', value: 'Depressed' }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">How are you feeling today?</h1>

      {/* Show the currently selected mood if available */}
      {currentMood && <p className="text-lg">Today's mood: {currentMood}</p>}

      {/* Mood selection buttons */}
      <div className="grid grid-cols-2 gap-4">
        {moods.map((m) => (
          <button
            key={m.value}
            onClick={() => handleSelect(m.value)}
            className="text-4xl p-4 border rounded hover:bg-gray-100"
          >
            {m.label}
          </button>
        ))}
      </div>
      {/* Link to the mood trends analytics page */}
      <Link href="/mood/trends" className="text-blue-600 underline">
        View Trends
      </Link>

      {/* Display loading spinner, errors and success messages */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Mood updated!</p>}
    </div>
  );
}
