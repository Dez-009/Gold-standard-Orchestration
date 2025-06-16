'use client';
// Admin system tasks page providing manual maintenance actions

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  triggerSubscriptionSync,
  triggerRenewalReminders
} from '../../../services/systemService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function SystemTasksPage() {
  const router = useRouter(); // Notes: Router used for auth redirects
  // Notes: Track loading state for each task button
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);

  // Notes: Verify admin access on mount
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  // Notes: Handler to trigger subscription synchronization
  const handleSync = async () => {
    setSyncing(true);
    try {
      await triggerSubscriptionSync();
    } catch {
      // Error toast handled in the service
    } finally {
      setSyncing(false);
    }
  };

  // Notes: Handler to trigger renewal reminder delivery
  const handleReminders = async () => {
    setSending(true);
    try {
      await triggerRenewalReminders();
    } catch {
      // Error toast handled in the service
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">System Tasks</h1>
      {/* Button to sync subscriptions using the admin endpoint */}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {syncing ? 'Syncing...' : 'Sync Subscriptions'}
      </button>
      {/* Button to send renewal reminders using the new service */}
      <button
        onClick={handleReminders}
        disabled={sending}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send Renewal Reminders'}
      </button>
    </div>
  );
}
