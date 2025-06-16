'use client';
// Account management page displaying subscription status and billing info
// Uses accountService to retrieve placeholder account details
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAccountDetails } from '../../services/accountService';
import {
  getToken,
  isTokenExpired,
  parseUserFromToken
} from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

// Shape of the account information retrieved from the backend
interface AccountInfo {
  tier: string;
  billing: string;
}

export default function AccountPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Notes: State holding the subscription info and billing text
  const [account, setAccount] = useState<AccountInfo | null>(null);
  // Notes: Track the logged-in user's email address
  const [email, setEmail] = useState<string | null>(null);
  // Notes: Flags for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to load account details from the backend
  const loadAccount = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAccountDetails();
      setAccount(data as AccountInfo);
    } catch {
      setError('Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  // Notes: Ensure a valid session then fetch account info on mount
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const user = parseUserFromToken(token);
    setEmail(user.email);
    loadAccount();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {/* Status indicators for network operations */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}

      {/* Display account information when available */}
      {!loading && !error && (
        <div className="w-full max-w-md space-y-4 border rounded p-4 bg-gray-50">
          {email && (
            <p>
              <span className="font-semibold">Email:</span> {email}
            </p>
          )}
          <p>
            <span className="font-semibold">Subscription:</span>{' '}
            {account?.tier || 'Free Tier'}
          </p>
          <p>
            <span className="font-semibold">Billing Info:</span>{' '}
            {account?.billing || 'No payment method on file'}
          </p>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Upgrade to Pro
          </button>
          <button className="w-full bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400">
            Manage Billing
          </button>
        </div>
      )}
    </div>
  );
}
