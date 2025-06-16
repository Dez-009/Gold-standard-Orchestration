// Service wrapper for admin Stripe webhook management
// Provides helpers to fetch recent webhook events and replay them on demand

import { getToken } from './authUtils';
import { getRecentWebhooks, replayWebhook as apiReplayWebhook } from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

// Shape describing a webhook event returned by the backend
export interface WebhookEvent {
  id: string;
  event_type: string;
  created_at: string;
}

// Retrieve the list of recent webhook events
export async function fetchRecentWebhooks() {
  // Notes: Grab the JWT token from localStorage for authentication
  const token = getToken();
  if (!token) {
    // Notes: Display an error when no token is available
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Call the API client to fetch recent events
    const data = await getRecentWebhooks(token);
    // Notes: Cast the result to the expected array shape
    return data as WebhookEvent[];
  } catch (err) {
    // Notes: Notify the user that fetching failed
    showError('Something went wrong');
    throw err;
  }
}

// Request the backend to replay a specific webhook event
export async function replayWebhook(eventId: string) {
  // Notes: Obtain the stored JWT token for authorization
  const token = getToken();
  if (!token) {
    // Notes: Alert the user if the session is missing
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Ask the backend to replay the selected webhook event
    const data = await apiReplayWebhook(eventId, token);
    showSuccess('Saved successfully');
    // Notes: Return the backend response, typically a success status
    return data as { status: string };
  } catch (err) {
    // Notes: Show an error toast when the replay fails
    showError('Something went wrong');
    throw err;
  }
}
