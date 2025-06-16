'use client';
// Page allowing the user to download a snapshot of their data

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { exportUserData } from '../../../services/dataExportService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function DataExportPage() {
  // Notes: Access the router for redirects when the session is invalid
  const router = useRouter();
  // Notes: Track loading state for generating the export package
  const [loading, setLoading] = useState(false);
  // Notes: Store an error message to display in the UI
  const [error, setError] = useState('');

  // Verify that a valid JWT token is present on mount
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  // Request the data export from the backend and trigger a download
  const handleExport = async () => {
    setLoading(true);
    setError('');
    try {
      // Notes: Use the service helper to fetch all user data
      const data = await exportUserData();
      // Notes: Create a downloadable blob from the JSON payload
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      // Notes: Generate a temporary object URL and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vida-export.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Notes: Update local error state and show toast on failure
      setError('Failed to export data');
      showError('Failed to export data');
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
      <h1 className="text-2xl font-bold">Export My Data</h1>

      {/* Button that initiates export on click */}
      <button
        onClick={handleExport}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        Download My Data
      </button>

      {/* Show spinner while the export is being prepared */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Display an error message if the export fails */}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
