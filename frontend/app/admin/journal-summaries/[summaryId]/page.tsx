'use client';

// Admin view for downloading any user's journal summary as PDF
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, isAdmin } from '../../../../services/authUtils';
import {
  downloadSummaryPDF,
  retryAgent,
  flagSummary,
  unflagSummary,
  getSummaryNotes,
  addSummaryNote,
  getFlagReasons
} from '../../../../services/apiClient';
import { fetchSummary, triggerRerun } from '../../../../services/adminJournalSummaryService';
import { showError, showSuccess } from '../../../../components/ToastProvider';
import { FiRefreshCw } from 'react-icons/fi';

interface ReasonRow {
  id: string;
  label: string;
  category?: string | null;
  created_at: string;
}

export default function AdminSummaryDownload({
  params
}: {
  params: { summaryId: string };
}) {
  const router = useRouter(); // Notes: Redirect helper
  const [loading, setLoading] = useState(false); // Notes: Download button state
  const [saving, setSaving] = useState(false); // Notes: Save button state
  const [summary, setSummary] = useState(''); // Notes: Fetched summary text
  const [timeline, setTimeline] = useState<any[]>([]); // Notes: Fetched notes timeline
  const [noteInput, setNoteInput] = useState(''); // Notes: New note textarea value
  const [showModal, setShowModal] = useState(false); // Notes: Confirmation modal visibility
  const [retryLoading, setRetryLoading] = useState(false); // Notes: Retry button state
  const [agent, setAgent] = useState('JournalSummarizationAgent'); // Notes: Selected agent for retry
  const agents = ['JournalSummarizationAgent', 'GoalSuggestionAgent', 'ProgressReportingAgent'];
  const [flagged, setFlagged] = useState(false); // Notes: Current flag state
  const [flagReason, setFlagReason] = useState(''); // Notes: Existing flag reason
  const [showFlag, setShowFlag] = useState(false); // Notes: Flag modal visibility
  const [flagReasons, setFlagReasons] = useState<ReasonRow[]>([]); // Notes: Reason options
  const [selectedReason, setSelectedReason] = useState(''); // Notes: Chosen reason
  const [flagNotes, setFlagNotes] = useState(''); // Notes: Additional notes
  const [flagLoading, setFlagLoading] = useState(false); // Notes: Flag API state

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
        setFlagged(Boolean(data.flagged));
        setFlagReason(data.flag_reason || '');
        const notes = await getSummaryNotes(token, params.summaryId);
        setTimeline(notes);
        const reasons = await getFlagReasons(token);
        setFlagReasons(reasons);
        if (reasons.length > 0) {
          setSelectedReason(reasons[0].label);
        }
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

  const handleAdd = async () => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const newNote = await addSummaryNote(token, params.summaryId, noteInput);
      setTimeline([newNote, ...timeline]);
      setNoteInput('');
    } catch {
      showError('Failed to add note');
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

  // Notes: send a flag request with selected reason and notes
  const handleFlag = async () => {
    const token = getToken();
    if (!token) return;
    setFlagLoading(true);
    try {
      const reasonText = selectedReason + (flagNotes ? `: ${flagNotes}` : '');
      await flagSummary(params.summaryId, reasonText, token);
      showSuccess('Summary flagged');
      setFlagged(true);
      setFlagReason(reasonText);
      setFlagNotes('');
      setShowFlag(false);
    } catch {
      showError('Failed to flag summary');
    } finally {
      setFlagLoading(false);
    }
  };

  // Notes: remove the moderation flag
  const handleUnflag = async () => {
    const token = getToken();
    if (!token) return;
    setFlagLoading(true);
    try {
      await unflagSummary(params.summaryId, token);
      showSuccess('Flag removed');
      setFlagged(false);
      setFlagReason('');
    } catch {
      showError('Failed to update');
    } finally {
      setFlagLoading(false);
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
      {/* Heading with flag status */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Summary Detail</h1>
        {flagged ? (
          flagReason.startsWith('Auto-flagged') ? (
            <span className="relative group bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Auto-Flagged
              <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded px-1 py-0.5 -top-6 left-1/2 -translate-x-1/2">
                This summary was flagged by automated moderation logic
              </span>
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Flagged</span>
          )
        ) : (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Not Flagged</span>
        )}
      </div>
      {flagged && flagReason && (
        <div className="bg-red-50 border border-red-200 p-2 rounded text-sm">
          {flagReason}
        </div>
      )}
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
      {/* Moderation controls */}
      {!flagged && (
        <button
          onClick={() => setShowFlag(true)}
          className="px-3 py-1 border rounded bg-red-600 text-white"
        >
          Flag Summary
        </button>
      )}
      {flagged && (
        <button
          onClick={handleUnflag}
          disabled={flagLoading}
          className="px-3 py-1 border rounded"
        >
          {flagLoading ? 'Updating...' : 'Remove Flag'}
        </button>
      )}
      {/* Notes Timeline */}
      <div className="w-full max-w-2xl space-y-2">
        <h2 className="font-semibold">Notes Timeline</h2>
        <div className="border rounded p-2 max-h-60 overflow-y-auto space-y-2 bg-white">
          {timeline.length === 0 && <p className="text-sm">No notes yet.</p>}
          {timeline.map((n) => (
            <div key={n.id} className="border-b pb-1 last:border-b-0">
              <p className="text-xs text-gray-500">
                {new Date(n.created_at).toLocaleString()} - Admin {n.author_id}
              </p>
              <p>{n.content}</p>
            </div>
          ))}
        </div>
        <textarea
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder="Add note"
          className="border rounded w-full p-2"
          rows={3}
        />
        <button
          onClick={handleAdd}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {saving ? 'Adding...' : 'Add Note'}
        </button>
      </div>
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
      {/* Modal for entering a flag reason */}
      {showFlag && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded space-y-4 w-80">
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="border rounded w-full p-2"
            >
              {flagReasons.map((r) => (
                <option key={r.id} value={r.label}>
                  {r.label}
                </option>
              ))}
            </select>
            <textarea
              value={flagNotes}
              onChange={(e) => setFlagNotes(e.target.value)}
              placeholder="Additional notes (optional)"
              className="border rounded w-full p-2"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowFlag(false)} className="px-3 py-1 border rounded">
                Cancel
              </button>
              <button onClick={handleFlag} disabled={flagLoading} className="px-3 py-1 bg-red-600 text-white rounded">
                {flagLoading ? 'Flagging...' : 'Confirm Flag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
