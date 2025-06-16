'use client';
// Page allowing the user to download their journals as a PDF

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { exportJournals } from '../../../services/journalService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function JournalExportPage() {
  // Notes: Router used to redirect on authentication failure
  const router = useRouter();
  // Notes: Track loading state while the PDF is generated
  const [loading, setLoading] = useState(false);
  // Notes: Store any error message to display to the user
  const [error, setError] = useState('');

  // Verify a valid token exists when the page loads
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  // Request the PDF export and trigger download
  const handleExport = async () => {
    setLoading(true);
    setError('');
    try {
      // Notes: Call the service to retrieve the PDF blob
      const blob = await exportJournals();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'journals.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Notes: Surface the failure to the user via toast and local state
      setError('Failed to export journals');
      showError('Failed to export journals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Export Journals</h1>

      {/* Button triggers the export on click */}
      <button
        onClick={handleExport}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        Export Journals to PDF
      </button>

      {/* Spinner displayed while generating the PDF */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Error message when export fails */}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
