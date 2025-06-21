'use client';
// Page listing all of the user's journal entries with quick links

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAllJournals } from '../../../services/journalService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';
import FusionBackground from '../../../components/FusionBackground';

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
    <FusionBackground>
      <div className="flex flex-col items-center min-h-screen p-4 space-y-6">
        {/* Link back to dashboard for convenience */}
        <Link 
          href="/dashboard" 
          className="self-start text-white hover:text-blue-200 transition-colors duration-200 underline"
        >
          ← Back to Dashboard
        </Link>

        {/* Main heading for the page */}
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Your Journal Entries
        </h1>

        {/* Conditional rendering for loading and error states */}
        {loading && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        )}
        
        {error && (
          <p className="text-red-200 bg-red-500/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            {error}
          </p>
        )}
        
        {!loading && journals.length === 0 && (
          <p className="text-white/80 text-lg">No journals found.</p>
        )}

        {/* List of journal cards */}
        <ul className="w-full max-w-2xl space-y-6">
          {journals.map((j) => (
            <li
              key={j.id}
              className="glass-card rounded-lg p-6 text-white"
            >
              <h2 className="text-xl font-semibold mb-2">
                {j.title ? j.title : 'Untitled'}
              </h2>
              <p className="text-sm text-white/70 mb-3">
                {formatDate(j.created_at)}
              </p>
              <p className="mb-6 text-white/90 leading-relaxed">
                {preview(j.content)}
              </p>
              <div className="flex space-x-3">
                <Link
                  href={`/user/journals/${j.id}`}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium"
                >
                  View
                </Link>
                <Link
                  href={`/user/journals/${j.id}/edit`}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-200 font-medium"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </FusionBackground>
  );
}
