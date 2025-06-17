'use client';
// Page displaying AI-extracted tags from the user's journals

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJournalTags } from '../../../services/journalService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function JournalTagsPage() {
  const router = useRouter();
  // Notes: Store the list of extracted tags
  const [tags, setTags] = useState<string[]>([]);
  // Notes: Track loading and error state for the request
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notes: Validate the session and fetch tags on mount
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
        // Notes: Request tag analysis from the backend service
        const data = await fetchJournalTags();
        setTags(data);
      } catch {
        setError('Failed to load tags');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Journal Tags</h1>

      {/* Loading spinner and error message */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && tags.length === 0 && <p>No tags found.</p>}

      {/* Render tags as clickable badges */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="cursor-pointer bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
