'use client';
// Daily check-in page allowing one submission per day
// Displays the existing check-in if already recorded

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MoodSelector from '../../components/MoodSelector';
import {
  fetchDailyCheckIn,
  submitDailyCheckIn
} from '../../services/checkinService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

// Shape of a daily check-in record returned by the backend
interface DailyCheckIn {
  id: number;
  reflection: string;
  mood: string;
  created_at: string;
}

export default function CheckinPage() {
  const router = useRouter(); // Used for auth redirection
  // Track the text describing how the day went
  const [reflection, setReflection] = useState('');
  // Selected mood value from the MoodSelector component
  const [mood, setMood] = useState('Excellent');
  // Holds today's check-in if it already exists
  const [existing, setExisting] = useState<DailyCheckIn | null>(null);
  // Loading and feedback state flags
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Helper to load today's check-in from the backend
  const loadCheckin = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDailyCheckIn();
      setExisting(data);
    } catch {
      setError('Failed to load check-in');
    } finally {
      setLoading(false);
    }
  };

  // Verify session on mount and fetch any existing check-in
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    loadCheckin();
  }, [router]);

  // Submit the reflection and mood for today
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const data = await submitDailyCheckIn(reflection, mood);
      setExisting(data);
      setSuccess(true);
    } catch {
      setError('Failed to save check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Daily Check-In</h1>

      {/* When a check-in exists, show it instead of the form */}
      {existing ? (
        <div className="border rounded p-4 bg-gray-100 w-full max-w-md">
          <p className="font-semibold mb-1">Mood: {existing.mood}</p>
          <p className="mb-2">{existing.reflection}</p>
          <p className="text-sm text-gray-600">
            {existing.created_at.split('T')[0]}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
          <MoodSelector value={mood} onChange={setMood} />
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="How was your day?"
            className="border rounded w-full p-2"
          />
          {/* Placeholder input for future goal progress feature */}
          <input
            disabled
            placeholder="Goal progress coming soon..."
            className="border rounded w-full p-2 text-gray-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Submit Check-In
          </button>
        </form>
      )}

      {/* Show loading spinner, errors, and success messages */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Check-in saved!</p>}
    </div>
  );
}
