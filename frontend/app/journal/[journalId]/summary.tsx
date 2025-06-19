'use client';
/**
 * Page summarizing a specific journal entry.
 * Shows a timeout banner when the agent fails to respond in time.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { orchestrateAiRequest } from '../../../services/apiClient';
import { showError } from '../../../components/ToastProvider';

export default function JournalSummaryPage({ params }: { params: { journalId: string } }) {
  const router = useRouter();
  // Notes: Store summary text and loading/error flags
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timedOut, setTimedOut] = useState(false);

  // Helper to invoke the agent and update state
  const loadSummary = async () => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Notes: Send a summarization request to the orchestration endpoint
      const data = await orchestrateAiRequest(`Summarize journal ${params.journalId}`, token);
      if (data.error === 'timeout') {
        // Display timeout banner so the user can retry
        setTimedOut(true);
      } else {
        setSummary(data.response);
        setTimedOut(false);
      }
    } catch {
      setError('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.journalId]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Journal Summary</h1>
      {timedOut && (
        <div className="w-full max-w-md bg-red-50 border-l-4 border-red-400 p-2 flex items-center space-x-2">
          <span>⏱️ Agent response timed out. Please try again.</span>
          <button onClick={loadSummary} className="ml-auto px-2 py-1 border rounded bg-white">
            Retry
          </button>
        </div>
      )}
      {loading && (
        <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && summary && (
        <p className="p-4 border rounded shadow bg-white">{summary}</p>
      )}
    </div>
  );
}
