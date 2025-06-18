'use client';

// Admin view for downloading any user's journal summary as PDF
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, isAdmin } from '../../../../services/authUtils';
import { downloadSummaryPDF, retryAgent } from '../../../../services/apiClient';
import { fetchSummary, provideNotes, triggerRerun } from '../../../../services/adminJournalSummaryService';
import { showError, showSuccess } from '../../../../components/ToastProvider';
import { FiRefreshCw } from 'react-icons/fi';

export default function AdminSummaryDownload({
  params
}: {
  params: { summaryId: string };
}) {
  const router = useRouter(); // Notes: Redirect helper
  const [loading, setLoading] = useState(false); // Notes: Download button state
  const [saving, setSaving] = useState(false); // Notes: Save button state
  const [summary, setSummary] = useState(''); // Notes: Fetched summary text
  const [notes, setNotes] = useState(''); // Notes: Admin notes textarea value
  const [showModal, setShowModal] = useState(false); // Notes: Confirmation modal visibility
  const [retryLoading, setRetryLoading] = useState(false); // Notes: Retry button state
  const [agent, setAgent] = useState('JournalSummarizationAgent'); // Notes: Selected agent for retry
  const agents = ['JournalSummarizationAgent', 'GoalSuggestionAgent', 'ProgressReportingAgent'];

  // Notes: Ensure the user is authenticated and has admin rights
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
        const data = await fetchSummary(params.summaryId);
        setSummary(data.summary_text);
        setNotes(data.admin_notes || '');
      } catch {
        showError('Failed to load summary');
      }
    };
    load();
  }, [router, params.summaryId]);

  const handleDownload = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      // Notes: Request the PDF from the backend
      const blob = await downloadSummaryPDF(token, params.summaryId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `summary_${params.summaryId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showError('Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await provideNotes(params.summaryId, notes);
    } catch {
      // Error toast shown in service
    } finally {
      setSaving(false);
    }
  };
  // Notes: request the backend to regenerate the summary
  const handleRerun = async () => {
    try {
      await triggerRerun(params.summaryId);
      const data = await fetchSummary(params.summaryId);
      setSummary(data.summary_text);
    } catch {
      // Error toast displayed in service
    } finally {
      setShowModal(false);
    }
  };

  // Notes: invoke the new admin retry endpoint for a specific agent
  const handleRetry = async () => {
    const token = getToken();
    if (!token) return;
    setRetryLoading(true);
    try {
      await retryAgent(params.summaryId, agent, token);
      showSuccess('Agent retry complete');
    } catch {
      showError('Failed to retry agent');
    } finally {
      setRetryLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link to the summary list */}
      <Link
        href="/admin/journal-summaries"
        className="self-start text-blue-600 underline"
      >
        Back to List
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Summary Detail</h1>
      {/* Summary text */}
      <p className="border p-4 rounded bg-gray-50 max-w-2xl whitespace-pre-line">
        {summary}
      </p>
      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Downloading...' : 'Download PDF'}
      </button>
      {/* Trigger the agent to regenerate this summary */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1 px-3 py-1 border rounded"
      >
        <FiRefreshCw /> Rerun Agent
      </button>
      {/* Admin-triggered retry for any agent */}
      {/* Admin override purpose: rerun an agent when results are missing or outdated */}
      <div className="flex items-center gap-2">
        <select
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
          className="border p-1 rounded"
        >
          {agents.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          onClick={handleRetry}
          disabled={retryLoading}
          className="px-3 py-1 border rounded"
        >
          {retryLoading ? 'Retrying...' : 'Retry Agent'}
        </button>
      </div>
      {/* Admin notes textarea */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Admin Notes"
        className="border rounded w-full max-w-2xl p-2"
        rows={4}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {saving ? 'Saving...' : 'Save Notes'}
      </button>
      {/* Confirmation modal shown when rerun is requested */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded space-y-4">
            <p>Rerun the agent using the original journal entry?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleRerun}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
