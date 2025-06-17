'use client';
// Journal entry details page rendering the full text of a single entry

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJournalById } from '../../../services/journalService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';
import {
  getPromptsForUser,
  ReflectionPrompt
} from '../../../services/reflectionPromptService';

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
  // Notes: Store reflection prompts returned from the backend
  const [prompts, setPrompts] = useState<ReflectionPrompt[]>([]);

  // Helper to decode the user id from the JWT token
  const parseUserId = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return String(payload.user_id);
    } catch {
      return null;
    }
  };

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

  // Fetch reflection prompts for the logged-in user
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const uid = parseUserId(token);
    if (!uid) return;
    getPromptsForUser(uid)
      .then(setPrompts)
      .catch(() => {});
  }, []);

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
      {/* Reflection prompts encouraging deeper thought */}
      {prompts.length > 0 && (
        <div className="w-full max-w-md p-4 bg-gray-50 italic rounded border-l-4 border-blue-200 space-y-2">
          <p className="font-semibold not-italic">Reflection Boost</p>
          <ul className="list-none space-y-1">
            {prompts.map((p) => (
              <li key={p.id} className="flex text-gray-700">
                <span className="mr-2">❝</span>
                <span>{p.prompt_text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
