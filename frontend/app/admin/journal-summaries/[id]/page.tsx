'use client';

// Admin view for downloading any user's journal summary as PDF
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, isAdmin } from '../../../../services/authUtils';
import { downloadSummaryPDF } from '../../../../services/apiClient';
import { fetchSummary, provideNotes } from '../../../../services/adminJournalSummaryService';
import { showError } from '../../../../components/ToastProvider';

export default function AdminSummaryDownload({
  params
}: {
  params: { id: string };
}) {
  const router = useRouter(); // Notes: Redirect helper
  const [loading, setLoading] = useState(false); // Notes: Download button state
  const [saving, setSaving] = useState(false); // Notes: Save button state
  const [summary, setSummary] = useState(''); // Notes: Fetched summary text
  const [notes, setNotes] = useState(''); // Notes: Admin notes textarea value

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
        const data = await fetchSummary(params.id);
        setSummary(data.summary_text);
        setNotes(data.admin_notes || '');
      } catch {
        showError('Failed to load summary');
      }
    };
    load();
  }, [router, params.id]);

  const handleDownload = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      // Notes: Request the PDF from the backend
      const blob = await downloadSummaryPDF(token, params.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `summary_${params.id}.pdf`;
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
      await provideNotes(params.id, notes);
    } catch {
      // Error toast shown in service
    } finally {
      setSaving(false);
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
    </div>
  );
}
