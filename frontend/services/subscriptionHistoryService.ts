// Service for fetching subscription history records for administrators

import { getToken } from './authUtils';
import { getSubscriptionHistory } from './apiClient';
import { showError } from '../components/ToastProvider';

// Shape of a subscription history record returned by the backend
export interface SubscriptionHistoryRecord {
  user_email: string;
  stripe_subscription_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  updated_at: string;
}

// Retrieve subscription history using stored authentication token
export async function fetchSubscriptionHistory() {
  const token = getToken();
  if (!token) {
    // Notes: Caller must be authenticated to access admin endpoints
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate HTTP request to the shared API client wrapper
    const data = await getSubscriptionHistory(token);
    return data as SubscriptionHistoryRecord[];
  } catch (err) {
    // Notes: Display an error toast on any failure
    showError('Something went wrong');
    throw err;
  }
}
