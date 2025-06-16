'use client';
// Journal history page listing previous entries with option to expand
// Fetches history on mount and handles session validation

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJournalHistory } from '../../../services/journalService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface Entry {
  id: number;
  content: string;
  created_at: string;
}

export default function JournalHistoryPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Store loaded entries along with UI state flags
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Track which entry is expanded to show full text
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Notes: Verify token validity then request journal history
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
        const data = await fetchJournalHistory();
        setEntries(data);
      } catch {
        setError('Failed to load journal history');
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, [router]);

  // Format ISO timestamps to YYYY-MM-DD for display
  const formatDate = (iso: string) => iso.split('T')[0];
  // Helper to show either a preview or the full text
  const getContent = (entry: Entry) => {
    if (expandedId === entry.id) return entry.content;
    return entry.content.length > 100
      ? `${entry.content.slice(0, 100)}...`
      : entry.content;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Journal History</h1>

      {/* Render based on loading/error state */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && entries.length === 0 && <p>No journal entries found.</p>}

      {/* List of journal entries */}
      <ul className="w-full max-w-md space-y-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="border rounded p-4 bg-gray-100 cursor-pointer"
            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          >
            <p>{getContent(entry)}</p>
            <p className="text-sm text-gray-600 mt-2">{formatDate(entry.created_at)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
