'use client';

// Page displaying a single journal summary with a download option
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '../../../../services/authUtils';
import { downloadSummaryPDF } from '../../../../services/apiClient';
import { showError } from '../../../../components/ToastProvider';

export default function SummaryDownloadPage({
  params
}: {
  params: { id: string };
}) {
  const router = useRouter(); // Notes: Used for redirecting on auth issues
  const [loading, setLoading] = useState(false); // Notes: Spinner state

  // Notes: Validate token on mount
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  const handleDownload = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      // Notes: Request PDF blob then trigger download
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

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Journal Summary</h1>
      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Downloading...' : 'Download PDF'}
      </button>
    </div>
  );
}
