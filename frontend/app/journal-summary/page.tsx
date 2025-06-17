'use client';

// Journal summary display page
// Fetches the AI-generated summary on mount and renders it in a card

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJournalSummary } from '../../services/journalSummaryService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

export default function JournalSummaryPage() {
  const router = useRouter(); // Notes: Used for redirection when auth fails
  const [summary, setSummary] = useState(''); // Notes: Holds summary text
  const [loading, setLoading] = useState(true); // Notes: Indicates fetch in progress
  const [error, setError] = useState(''); // Notes: Stores error messages

  // Notes: Load the summary once when the component mounts
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Notes: Redirect unauthenticated users to login
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      try {
        const data = await fetchJournalSummary();
        setSummary(data.summary);
      } catch {
        setError('Failed to load summary');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Journal Summary</h1>
      {/* Loading spinner */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Error message */}
      {error && <p className="text-red-600">{error}</p>}
      {/* Summary card */}
      {!loading && !error && (
        <div className="p-4 bg-gray-100 rounded w-full max-w-md">
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
