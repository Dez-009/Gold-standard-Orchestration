'use client';
/**
 * Page displaying a single journal summary along with feedback UI.
 * It fetches the summary text and allows the user to rate it.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';
import { fetchJournalSummary } from '../../../services/journalSummaryService';
import AgentFeedback from '../../../components/AgentFeedback';
import AgentOutputCard from '../../../components/AgentOutputCard';

export default function SummaryWithFeedback({ params }: { params: { summaryId: string } }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Track retry count and timeout flag from the backend metadata
  const [retryCount, setRetryCount] = useState(0);
  const [timeout, setTimeoutFlag] = useState(false);

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
        const data = await fetchJournalSummary();
        // Notes: Store text and metadata for notification banner
        setText(data.summary);
        setRetryCount(data.retry_count);
        setTimeoutFlag(data.timeout_occurred);
      } catch {
        setError('Failed to load summary');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Journal Summary</h1>
      {loading && <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full" />}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="w-full max-w-md space-y-2">
          {/* Display the summary with retry/timeout notice */}
          <AgentOutputCard
            text={text}
            retryCount={retryCount}
            timeoutOccurred={timeout}
          />
          <AgentFeedback summaryId={params.summaryId} />
        </div>
      )}
    </div>
  );
}
