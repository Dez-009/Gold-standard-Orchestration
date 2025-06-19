'use client';
// Page listing all of the user's journal entries with quick links

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAllJournals } from '../../../services/journalService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

// Shape representing a journal entry returned by the backend
interface Journal {
  id: number;
  title: string | null;
  content: string;
  created_at: string;
}

export default function JournalsPage() {
  const router = useRouter(); // Notes: Used for navigation on auth failure
  // Store the list of journals once retrieved from the API
  const [journals, setJournals] = useState<Journal[]>([]);
  // Track loading and error state for user feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper called on mount to validate the token then load journals
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Notes: Clear the stale token and redirect back to login
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      try {
        // Notes: Request all journal entries from the backend service
        const data = await fetchAllJournals();
        setJournals(data);
      } catch {
        setError('Failed to load journals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Utility to truncate a long content string for preview purposes
  const preview = (text: string) =>
    text.length > 100 ? `${text.slice(0, 100)}...` : text;
  // Format ISO timestamps as a simple date
  const formatDate = (iso: string) => iso.split('T')[0];

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard for convenience */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Main heading for the page */}
      <h1 className="text-2xl font-bold">Your Journal Entries</h1>

      {/* Conditional rendering for loading and error states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && journals.length === 0 && <p>No journals found.</p>}

      {/* List of journal cards */}
      <ul className="w-full max-w-md space-y-4">
        {journals.map((j) => (
          <li
            key={j.id}
            className="border rounded p-4 bg-gray-100 hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold">
              {j.title ? j.title : 'Untitled'}
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              {formatDate(j.created_at)}
            </p>
            <p className="mb-4">{preview(j.content)}</p>
            <div className="flex space-x-2">
              <Link
                href={`/user/journals/${j.id}`}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View
              </Link>
              <Link
                href={`/user/journals/${j.id}/edit`}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
