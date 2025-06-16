'use client';
// Journal entry details page rendering the full text of a single entry

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJournalById } from '../../../services/journalService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

// Shape of the journal entry returned from the backend
interface Entry {
  id: number;
  title: string | null;
  content: string;
  created_at: string;
  // Optional mood metadata associated with the entry
  mood?: string | null;
}

// Component receives the dynamic id param from the route
export default function JournalDetailsPage({
  params
}: {
  params: { id: string };
}) {
  const router = useRouter(); // Notes: Router used for redirects
  // Local state storing the fetched entry or null when not found
  const [entry, setEntry] = useState<Entry | null>(null);
  // Flags for loading status and error messages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper to fetch the entry when the page loads
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Notes: Redirect to login on invalid or expired token
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      try {
        // Notes: Request the specific journal entry by id
        const data = await fetchJournalById(params.id);
        setEntry(data);
      } catch {
        // Notes: Show user-friendly message when the entry is missing
        setError('Journal not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, router]);

  // Format the timestamp to display just the date
  const formatDate = (iso: string) => iso.split('T')[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation link back to the journal list */}
      <Link href="/journal" className="self-start text-blue-600 underline">
        Back to Journal
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Journal Entry</h1>

      {/* Conditional rendering based on load and error state */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}

      {/* Show the entry details once loaded */}
      {entry && !loading && (
        <div className="border rounded p-4 w-full max-w-md space-y-2 bg-gray-100">
          {entry.title && <h2 className="text-xl font-semibold">{entry.title}</h2>}
          <p>{entry.content}</p>
          <p className="text-sm text-gray-600">Created: {formatDate(entry.created_at)}</p>
          {entry.mood && (
            <p className="text-sm text-gray-600">Mood: {entry.mood}</p>
          )}
          <div className="flex space-x-2 pt-2">
            {/* Link to the edit page for this entry */}
            <Link
              href={`/journals/${params.id}/edit`}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
