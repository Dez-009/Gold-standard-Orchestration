'use client';
// Page displaying a history of coaching sessions
// On mount it loads sessions from the backend and lists them

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchSessions } from '../../services/sessionService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

// Shape of a single session record returned from the backend
interface Session {
  id: number;
  summary: string | null;
  created_at: string;
}

export default function SessionsPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Local state holding the array of sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  // Flags for loading state and potential error messages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notes: Ensure session is valid then load sessions once
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      try {
        const data = await fetchSessions();
        setSessions(data);
      } catch {
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Format ISO timestamps so only the date portion is shown
  const formatDate = (iso: string) => iso.split('T')[0];

  // Placeholder handler when a session is clicked
  const handleClick = (session: Session) => {
    // For now simply alert the user; a full page will be added later
    alert(`Open conversation for session ${session.id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation link back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Coaching Sessions</h1>

      {/* Conditional rendering based on load state */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && sessions.length === 0 && <p>No sessions found.</p>}

      {/* List each session with basic styling */}
      <ul className="w-full max-w-md space-y-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="border rounded p-4 bg-gray-100 cursor-pointer"
            onClick={() => handleClick(session)}
          >
            <p>{session.summary}</p>
            <p className="text-sm text-gray-600 mt-2">{formatDate(session.created_at)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
