// Daily check-in page allowing users to record their mood and reflections
// Fetches previous check-ins on load and displays them below the form

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveCheckin, fetchCheckins } from '../../services/checkinService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

interface Checkin {
  id: number;
  reflection: string;
  mood: string;
  created_at: string;
}

export default function CheckinPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Local state for the reflection text input
  const [reflection, setReflection] = useState('');
  // Track the selected mood from a short list of options
  const [mood, setMood] = useState('Great');
  // Store the list of previously submitted check-ins
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  // Flags for loading status, error messages and success indicator
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Helper to retrieve recent check-ins from the backend service
  const loadCheckins = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCheckins();
      setCheckins(data);
    } catch {
      setError('Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  };

  // Notes: Ensure the user session is valid before making requests
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    // Notes: Load existing check-ins after verifying the session
    loadCheckins();
  }, [router]);

  // Submit the current reflection and mood to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await saveCheckin(reflection, mood);
      setReflection('');
      setMood('Great');
      setSuccess(true);
      await loadCheckins();
    } catch {
      setError('Failed to save check-in');
    } finally {
      setLoading(false);
    }
  };

  // Format ISO timestamps to a short date string for display
  const formatDate = (iso: string) => iso.split('T')[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Daily Check-In</h1>

      {/* Form capturing the reflection text and mood choice */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="How are you feeling today?"
          className="border rounded w-full p-2"
        />
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="border rounded w-full p-2"
        >
          <option>Great</option>
          <option>Good</option>
          <option>Okay</option>
          <option>Bad</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Check-In
        </button>
      </form>

      {/* Display status indicators */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Check-in saved!</p>}

      {/* List previously saved check-ins */}
      <ul className="w-full max-w-md space-y-2">
        {checkins.map((c) => (
          <li key={c.id} className="border rounded p-4 bg-gray-100">
            <p className="font-semibold">{c.mood}</p>
            <p>{c.reflection}</p>
            <p className="text-sm text-gray-600 mt-2">{formatDate(c.created_at)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
