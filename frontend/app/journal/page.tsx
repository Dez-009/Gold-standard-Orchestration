'use client';
// Journal history page
// Fetches entries on mount and lists them with simple styling

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJournalEntries } from '../../services/journalService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

interface Entry {
  id: number;
  content: string;
  created_at: string;
}

export default function JournalPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Local state for entries along with loading and error flags
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notes: Validate session then load journal history once
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const loadEntries = async () => {
      try {
        const data = await fetchJournalEntries();
        setEntries(data);
      } catch (err) {
        setError('Failed to load journal history');
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, [router]);

  // Helper to format ISO date strings as YYYY-MM-DD
  const formatDate = (iso: string) => iso.split('T')[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Journal History</h1>

      {/* Display states: loading spinner, error message or list of entries */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}

      <ul className="w-full max-w-md space-y-2">
        {entries.map((entry) => (
          <li key={entry.id} className="border rounded p-4 bg-gray-100">
            {/* Link to the new journal details page */}
            <Link href={`/user/journals/${entry.id}`} className="block space-y-1">
              <p>{entry.content}</p>
              <p className="text-sm text-gray-600">{formatDate(entry.created_at)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
