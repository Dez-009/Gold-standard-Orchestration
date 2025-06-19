'use client';
// Page for creating a new journal entry with optional goal linkage

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createJournalEntry } from '../../../services/journalService';
import { fetchGoals } from '../../../services/goalService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../../components/ToastProvider';

// Shape describing a goal returned by the backend
interface Goal {
  id: number;
  content: string;
}

export default function NewJournalPage() {
  const router = useRouter();
  // Form fields for the new entry
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // List of available goals to link against
  const [goals, setGoals] = useState<Goal[]>([]);
  // Selected goal id stored as a string for the dropdown
  const [linkedGoal, setLinkedGoal] = useState('');
  // Loading flag while fetching goals
  const [loading, setLoading] = useState(true);
  // Saving flag while submitting the entry
  const [saving, setSaving] = useState(false);
  // Error message shown to the user
  const [error, setError] = useState('');

  // Load available goals on mount and validate the session
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
        // Notes: Retrieve goals so the user can link the journal entry
        const data = await fetchGoals();
        setGoals(data);
      } catch {
        setError('Failed to load goals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Helper to decode the user id from the JWT
  const parseUserId = (token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id as number;
    } catch {
      return null;
    }
  };

  // Submit the new journal entry to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please fill out the journal content');
      return;
    }
    const token = getToken();
    if (!token) {
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const userId = parseUserId(token);
    if (!userId) {
      showError('Invalid session');
      router.push('/login');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        user_id: userId,
        title,
        content,
      };
      // Notes: Only send linked_goal_id when a goal is selected
      if (linkedGoal) payload['linked_goal_id'] = Number(linkedGoal);
      await createJournalEntry(payload);
      showSuccess('Journal saved!');
      router.push('/journal');
    } catch {
      setError('Failed to save journal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to journal history */}
      <Link href="/journal" className="self-start text-blue-600 underline">
        Back to Journal
      </Link>

      {/* Heading for the new journal form */}
      <h1 className="text-2xl font-bold">New Journal Entry</h1>

      {/* Loading spinner or error message */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}

      {/* Form displayed once goals have loaded */}
      {!loading && (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded w-full p-2"
          />
          <select
            value={linkedGoal}
            onChange={(e) => setLinkedGoal(e.target.value)}
            className="border rounded w-full p-2"
          >
            <option value="">No goal</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.content}
              </option>
            ))}
          </select>
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
            {saving ? 'Saving...' : 'Create Entry'}
          </button>
        </form>
      )}
    </div>
  );
}
