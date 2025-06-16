'use client';
// Page prompting the user to permanently delete their account

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { requestAccountDeletion } from '../../../services/accountService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

export default function DeleteAccountPage() {
  // Notes: Access router for navigation on success or session expiry
  const router = useRouter();
  // Notes: Track the confirmation text entered by the user
  const [confirmText, setConfirmText] = useState('');
  // Notes: Manage loading and error states for UX feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verify a valid JWT token exists when the page loads
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  // Submit the deletion request when the user confirms
  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setLoading(true);
    setError('');
    try {
      // Notes: Call the service helper to remove the account
      await requestAccountDeletion();
      localStorage.removeItem('token');
      showSuccess('Account deleted');
      router.push('/');
    } catch {
      setError('Failed to delete account');
      showError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Warning heading for destructive action */}
      <h1 className="text-2xl font-bold text-red-600">Delete Account</h1>
      <p className="text-red-600">Warning: this action is permanent and will remove all your data.</p>

      {/* Confirmation text field */}
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="Type DELETE to confirm"
        className="border border-red-600 rounded p-2 w-full max-w-md"
      />

      {/* Button to perform deletion when confirmed */}
      <button
        onClick={handleDelete}
        disabled={confirmText !== 'DELETE' || loading}
        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Deleting...' : 'Permanently Delete Account'}
      </button>

      {/* Display an error message on failure */}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
