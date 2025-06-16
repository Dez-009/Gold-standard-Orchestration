'use client';
// Page for editing an existing journal entry. Loads the current entry
// and submits updates back to the backend.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchJournalById,
  updateJournalEntry
} from '../../../../services/journalService';
import { getToken, isTokenExpired } from '../../../../services/authUtils';
import { showError, showSuccess } from '../../../../components/ToastProvider';

// Shape describing the journal entry record
interface Entry {
  id: number;
  title: string | null;
  content: string;
  created_at: string;
}

export default function EditJournalPage({
  params
}: {
  params: { id: string };
}) {
  const router = useRouter(); // Used for redirects after actions
  // Form fields for title and content
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // Flags for loading the entry and submitting updates
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch the existing journal entry on page load
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Redirect to login if the session is invalid
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const loadEntry = async () => {
      try {
        // Retrieve the journal entry data from the backend
        const data: Entry = await fetchJournalById(params.id);
        setTitle(data.title ?? '');
        setContent(data.content);
      } catch {
        setError('Failed to load journal entry');
      } finally {
        setLoading(false);
      }
    };
    loadEntry();
  }, [params.id, router]);

  // Submit updated journal fields to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateJournalEntry(params.id, { title, content });
      showSuccess('Journal updated!');
      router.push(`/journals/${params.id}`);
    } catch {
      setError('Failed to update journal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to the journal entry details */}
      <Link href={`/journals/${params.id}`} className="self-start text-blue-600 underline">
        Back to Entry
      </Link>

      {/* Heading for the edit form */}
      <h1 className="text-2xl font-bold">Edit Journal Entry</h1>

      {/* Show spinner while loading the entry */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}

      {/* Form for editing once data is loaded */}
      {!loading && (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded w-full p-2"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border rounded w-full p-2"
            rows={6}
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Update Entry'}
          </button>
        </form>
      )}
    </div>
  );
}
