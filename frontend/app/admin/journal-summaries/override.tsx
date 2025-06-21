'use client';

// Admin page for manually re-running the journal summarization agent
// Includes a table of prior overrides and a form to log a new one
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getToken,
  isTokenExpired,
  isAdmin
} from '../../../../services/authUtils';
import {
  fetchSummary
} from '../../../../services/adminJournalSummaryService';
import {
  getOverrideHistory,
  postOverrideRun
} from '../../../../services/apiClient';
import { showError, showSuccess } from '../../../../components/ToastProvider';

interface OverrideRow {
  id: string;
  timestamp: string;
  reason: string | null;
  run_id: string;
}

export default function OverridePage({
  params
}: {
  params: { id: string };
}) {
  const router = useRouter();
  // Notes: store retrieved summary to access user_id
  const [summaryUserId, setSummaryUserId] = useState<number | null>(null);
  const [history, setHistory] = useState<OverrideRow[]>([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  // Notes: load summary details and override history
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      try {
        const data = await fetchSummary(params.id);
        setSummaryUserId(data.user_id);
        const hist = await getOverrideHistory(
          token,
          data.user_id,
          'JournalSummarizationAgent'
        );
        setHistory(hist as OverrideRow[]);
      } catch {
        showError('Failed to load override history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, params.id]);

  const handleRerun = async () => {
    const token = getToken();
    if (!token || !summaryUserId) return;
    try {
      await postOverrideRun(token, params.id, reason);
      showSuccess('Override triggered');
      const hist = await getOverrideHistory(
        token,
        summaryUserId,
        'JournalSummarizationAgent'
      );
      setHistory(hist as OverrideRow[]);
      setReason('');
    } catch {
      showError('Failed to trigger override');
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString();
  const hasOverride = history.length > 0;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link
        href={`/admin/journal-summaries/${params.id}`}
        className="self-start text-blue-600 underline"
      >
        Back
      </Link>
      <h1 className="text-2xl font-bold flex items-center gap-2">
        Override Summary
        {hasOverride && (
          <span className="px-2 py-1 text-sm rounded bg-yellow-200">Overridden</span>
        )}
      </h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {!loading && history.length > 0 && (
        <table className="text-sm border divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-2 py-1">Date</th>
              <th className="px-2 py-1">Reason</th>
              <th className="px-2 py-1">Run ID</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="odd:bg-gray-100 text-center">
                <td className="border px-2 py-1">{fmt(h.timestamp)}</td>
                <td className="border px-2 py-1">{h.reason || '-'}</td>
                <td className="border px-2 py-1">{h.run_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && (
        <div className="flex flex-col items-center gap-2 w-full max-w-md">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Override reason"
            className="border rounded w-full p-2"
            rows={3}
          />
          <button
            onClick={handleRerun}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Re-run
          </button>
        </div>
      )}
    </div>
  );
}
