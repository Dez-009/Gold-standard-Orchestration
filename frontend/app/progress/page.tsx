'use client';

// Progress report page under /progress
// Notes: Fetches AI generated progress text when mounted
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProgressReport } from '../../services/progressReportService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

export default function ProgressReportPage() {
  const router = useRouter(); // Notes: For redirecting on auth failure
  const [report, setReport] = useState<string>(''); // Notes: Stores the report text
  const [loading, setLoading] = useState(true); // Notes: Indicates fetch state
  const [error, setError] = useState(''); // Notes: Holds error message for UI

  // Notes: Load the progress report on initial render
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Notes: Clear stale token and redirect to login
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const loadReport = async () => {
      try {
        const data = await fetchProgressReport();
        setReport(data?.report ?? '');
      } catch {
        setError('Failed to load progress report');
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Your Progress Report</h1>
      {/* Spinner while the report is loading */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Error message when fetching fails */}
      {error && <p className="text-red-600">{error}</p>}
      {/* Empty state when no report returned */}
      {!loading && !error && !report && <p>No progress report available yet.</p>}
      {/* Display the report inside a styled card */}
      {report && (
        <div className="border rounded p-4 bg-gray-100 w-full max-w-md">
          <p>{report}</p>
        </div>
      )}
    </div>
  );
}
