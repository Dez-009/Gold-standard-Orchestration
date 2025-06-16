'use client';
// Admin page allowing manual replay of Stripe webhook events

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchRecentWebhooks,
  replayWebhook
} from '../../../services/webhookService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

// Shape describing a webhook event row in the table
interface WebhookEvent {
  id: string;
  event_type: string;
  created_at: string;
}

export default function WebhookAdminPage() {
  const router = useRouter(); // Notes: Router used for redirects when auth fails
  // Notes: Local state for event list and page status
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replaying, setReplaying] = useState<string | null>(null);

  // Notes: Verify admin access and load recent webhook events on mount
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Notes: Request the list of recent webhook events from the service
        const data = await fetchRecentWebhooks();
        setEvents(data);
      } catch {
        // Notes: Show a message when the fetch fails
        setError('Failed to load webhooks');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Handler to replay a specific webhook event
  const handleReplay = async (id: string) => {
    setReplaying(id);
    try {
      await replayWebhook(id);
    } catch {
      // Error toast already shown in service, update local error state for UI
      setError('Failed to replay webhook');
    } finally {
      setReplaying(null);
    }
  };

  // Notes: Format timestamps for display in the table
  const fmt = (t: string) => new Date(t).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Webhook Events</h1>
      {/* Loading, error, and empty states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && events.length === 0 && <p>No events found.</p>}
      {/* Table of webhook events */}
      {!loading && !error && events.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Event ID</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => (
                <tr key={evt.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2 whitespace-nowrap">{evt.id}</td>
                  <td className="border px-4 py-2">{evt.event_type}</td>
                  <td className="border px-4 py-2">{fmt(evt.created_at)}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleReplay(evt.id)}
                      disabled={replaying === evt.id}
                      className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {replaying === evt.id ? 'Replaying...' : 'Replay'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
